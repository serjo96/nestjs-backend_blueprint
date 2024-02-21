import {BadRequestException, Inject, Injectable, forwardRef, NotFoundException} from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {ConfigService} from "@nestjs/config";
import dayjs from "dayjs";

import { UsersService } from '@user/users.service';

import { JWTService } from '~/auth/jwt.service';
import { EmailService } from '~/email/email.service';
import { isElapsedTime } from '~/utils/isElapsedTime';
import { GetRepositoryMethodsArgs } from '~/utils/typeUtils/getRepositoryMethodsArgs';

import { EmailVerificationEntity } from './email-verification.entity';
import {ForgottenPasswordEntity} from "~/auth/entity/forgotten-password.entity";
import {DatabaseError} from "~/common/exceptions/DatabaseError";
import {EncryptionService} from "~/auth/EncryptionService";
import {UserEntity} from "@user/users.entity";
import {FindOptionsWhere} from "typeorm/find-options/FindOptionsWhere";

@Injectable()
export class EmailVerificationService {
  constructor(
    @InjectRepository(EmailVerificationEntity)
    private readonly emailVerificationRepository: Repository<EmailVerificationEntity>,
    @InjectRepository(ForgottenPasswordEntity)
    private readonly forgottenPasswordRepository: Repository<ForgottenPasswordEntity>,

    private readonly jwtService: JWTService,
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

  public async createEmailToken(email: string): Promise<string | null> {
    let emailToken = null;
    const emailVerification = await this.findOneBy({
      user: {
        email
      },
    });
    const elapsedTime = emailVerification && isElapsedTime(emailVerification.expirationDate);

    if (emailVerification && elapsedTime) {
      // TODO: Add exception with returned timestamp
      throw new BadRequestException('Email sent recently');
    }

    if (emailVerification) {
      await this.deleteEmailVerification(emailVerification.id);
    }

    emailToken = this.encryptionService.generateToken(email);
    const expirationDate = dayjs().add(1, 'day').toDate();

    await this.saveEmailVerification({
      token: emailToken,
      expirationDate,
    });

    return emailToken;
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

    // If the user already has a forgotten password token, check if enough time has elapsed
    if (user.forgottenPassword) {
      const elapsedTime = isElapsedTime(user.forgottenPassword.timestamp);
      if (!elapsedTime) {
        // Not enough time has elapsed since the last token was sent
        throw new BadRequestException('Email sent recently');
      }
    }

    // If no token exists or enough time has elapsed, save a new or updated token
    return await this.saveForgottenPasswordToken({
      id: user.forgottenPassword?.id, // Reuse existing ID if available
      token: emailToken,
      timestamp: newTimestamp,
      expirationDate
    });
  }

  public async validateResetPasswordToken(record: ForgottenPasswordEntity): Promise<ForgottenPasswordEntity> {
    if (!record) {
      throw new NotFoundException('Token not found.');
    }

    const tokenHasExpired = dayjs().isAfter(dayjs(record.expirationDate));
    if (tokenHasExpired) {
      throw new BadRequestException('Token has expired.');
    }

    const now = dayjs();
    const minutesSinceLastAttempt = record.lastAttemptDate ? now.diff(dayjs(record.lastAttemptDate), 'minute') : Number.MAX_SAFE_INTEGER;

    // After the second attempt, add a delay
    const delayAfterSecondAttempt = 5;// Delay in minutes after the second attempt
    if (record.attempts >= 2 && minutesSinceLastAttempt < delayAfterSecondAttempt) {
      throw new BadRequestException('Please wait before trying again.');
    }

    // Update the number of attempts and the time of the last attempt
    record.attempts += 1;
    record.lastAttemptDate = now.toDate();
    await this.forgottenPasswordRepository.save(record);

    return record;
  }
}
