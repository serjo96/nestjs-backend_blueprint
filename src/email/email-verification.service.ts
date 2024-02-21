import {BadRequestException, Inject, Injectable, forwardRef, NotFoundException} from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {ConfigService} from "@nestjs/config";
import dayjs from "dayjs";

import { UsersService } from '@user/users.service';

import { EmailService } from '~/email/email.service';
import { GetRepositoryMethodsArgs } from '~/utils/typeUtils/getRepositoryMethodsArgs';

import { EmailVerificationEntity } from './email-verification.entity';
import {ForgottenPasswordEntity} from "~/auth/entity/forgotten-password.entity";
import {DatabaseError} from "~/common/exceptions/DatabaseError";
import {EncryptionService} from "~/auth/EncryptionService";
import {UserEntity} from "@user/users.entity";
import {FindOptionsWhere} from "typeorm/find-options/FindOptionsWhere";
import {RateLimitException} from "~/common/exceptions/RateLimitException";

@Injectable()
export class EmailVerificationService {
  constructor(
    @InjectRepository(EmailVerificationEntity)
    private readonly emailVerificationRepository: Repository<EmailVerificationEntity>,
    @InjectRepository(ForgottenPasswordEntity)
    private readonly forgottenPasswordRepository: Repository<ForgottenPasswordEntity>,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,

    @Inject(forwardRef(() => EmailService))
    private emailService: EmailService,
    private encryptionService: EncryptionService,
  ) {}

  public findOneBy(
    where: FindOptionsWhere<EmailVerificationEntity>
  ): Promise<EmailVerificationEntity | null> {
    return this.emailVerificationRepository.findOneBy(where).catch(err => {
      throw new DatabaseError(err.message);
    });
  }

  public deleteEmailVerification(where: GetRepositoryMethodsArgs<EmailVerificationEntity, 'delete'>[0]) {
    return this.emailVerificationRepository.delete(where);
  }

  public deleteForgottenPassword(where: GetRepositoryMethodsArgs<ForgottenPasswordEntity, 'delete'>[0]) {
    return this.forgottenPasswordRepository.delete(where);
  }

  public findForgottenPasswordUser(
    where: GetRepositoryMethodsArgs<ForgottenPasswordEntity, 'findOne'>[0]['where'],
  ): Promise<ForgottenPasswordEntity> {
    return this.forgottenPasswordRepository.findOne({
      where,
      relations: ['user'],
    });
  }

  public saveEmailVerification(data: Partial<EmailVerificationEntity>): Promise<EmailVerificationEntity | undefined> {
    let entity = EmailVerificationEntity.create(data as EmailVerificationEntity);

    return this.emailVerificationRepository.save(entity).catch(err => {
      throw new DatabaseError(err.message);
    });
  }

  public async verifyEmail(token: string) {
    const verificationRecord = await this.emailVerificationRepository.findOne({
      where: { token },
      relations: ['user']
    }).catch(err => {
      throw new DatabaseError(err.message);
    });

    if (!verificationRecord) {
      throw new BadRequestException('Email token not found.');
    }

    const isExpired = dayjs().isAfter(dayjs(verificationRecord.expirationDate));
    if (isExpired) {
      // Optional: it is possible to remove a token entry from the database if it has expired
      await this.emailVerificationRepository.remove(verificationRecord).catch(err => {
        throw new DatabaseError(err.message);
      });
      throw new BadRequestException('Email token is expired.');
    }


    if (verificationRecord.user) {
      await this.usersService.updateUserFiled(verificationRecord.user.id, { confirmed: true });
      // Remove used user token
      await this.emailVerificationRepository.remove(verificationRecord);
    } else {
      throw new BadRequestException('Associated user not found.');
    }
    return verificationRecord.user.email
  }

  public saveForgottenPasswordToken(data: Partial<ForgottenPasswordEntity>) {
    const userForgotPassword = ForgottenPasswordEntity.create(data as ForgottenPasswordEntity);

    return this.forgottenPasswordRepository.save(userForgotPassword);
  }

  public async createForgottenPasswordToken(user: UserEntity) {
    const emailToken = this.encryptionService.generateToken(user.email);
    const expirationDate = dayjs().add(1, 'day').toDate();
    const newTimestamp = new Date();
    const tokenPayload =  {
      token: emailToken,
      expirationDate,
      attempts: 1,
      lastAttemptDate: newTimestamp
    };

    return this.forgottenPasswordRepository.create(tokenPayload);
  }
  public async createVerificationToken(user: UserEntity) {
    const emailToken = this.encryptionService.generateToken(user.email);
    const expirationDate = dayjs().add(1, 'day').toDate();
    const newTimestamp = new Date();
    const tokenPayload =  {
      id: user.emailVerification?.id, // Reuse existing ID if available
      token: emailToken,
      expirationDate,
      attempts: 1,
      lastAttemptDate: newTimestamp
    };

    return this.emailVerificationRepository.create(tokenPayload);
  }

  public async validateResetPasswordToken(email: string): Promise<ForgottenPasswordEntity> {
    const user = await this.usersService.findByEmail(email, { forgottenPassword: true });
    const forgottenPasswordEntity = user?.forgottenPassword;

    if (!user) {
      throw new NotFoundException(`User doesn't exist`);
    }

    const tokenHasExpired = dayjs().isAfter(dayjs(forgottenPasswordEntity.expirationDate));
    if (tokenHasExpired) {
      throw new BadRequestException('Token has expired.');
    }

    const now = dayjs();
    const minutesSinceLastAttempt = forgottenPasswordEntity.lastAttemptDate ? now.diff(dayjs(forgottenPasswordEntity.lastAttemptDate), 'minute') : Number.MAX_SAFE_INTEGER;

    // After the second attempt, add a delay
    const delayAfterSecondAttempt = 5;// Delay in minutes after the second attempt
    if (forgottenPasswordEntity.attempts >= 2 && minutesSinceLastAttempt < delayAfterSecondAttempt) {
      // Get the unlock time in Unix format
      const unlockTime = now.add(delayAfterSecondAttempt - minutesSinceLastAttempt, 'minute').unix();
      throw new RateLimitException('Please wait before trying again.', unlockTime);
    }

    // Update the number of attempts and the time of the last attempt
    forgottenPasswordEntity.attempts += 1;
    forgottenPasswordEntity.lastAttemptDate = now.toDate();
    await this.forgottenPasswordRepository.save(forgottenPasswordEntity);

    return forgottenPasswordEntity;
  }

  public validateToken(entity: EmailVerificationEntity | ForgottenPasswordEntity): EmailVerificationEntity | ForgottenPasswordEntity {
    const now = dayjs();
    const tokenHasExpired = now.isAfter(dayjs(entity.expirationDate));
    if (tokenHasExpired) {
      throw new BadRequestException('Token has expired.');
    }

    const minutesSinceLastAttempt = entity.lastAttemptDate
      ? now.diff(dayjs(entity.lastAttemptDate), 'minute')
      : Number.MAX_SAFE_INTEGER;

    const delayAfterSecondAttempt = 5; // Задержка в минутах после второй попытки
    if (entity.attempts >= 2 && minutesSinceLastAttempt < delayAfterSecondAttempt) {
      const unlockTime = now.add(delayAfterSecondAttempt - minutesSinceLastAttempt, 'minute').unix();
      throw new RateLimitException('Please wait before trying again.', unlockTime);
    }

    entity.attempts += 1;
    entity.lastAttemptDate = now.toDate();

    return entity;
  }
}
