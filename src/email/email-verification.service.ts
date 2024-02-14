import { BadRequestException, Inject, Injectable, forwardRef } from "@nestjs/common";
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
import {FindOptionsRelations} from "typeorm/find-options/FindOptionsRelations";
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
    } else {
      emailToken = this.encryptionService.generateToken(email);
      const expirationDate = dayjs().add(1, 'day').toDate();

      await this.saveEmailVerification({
        token: emailToken,
        expirationDate,
      });
    }
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

  public saveForgottenPasswordToken(data: { id?: string; token: string; timestamp: Date }) {
    const userForgotPassword = ForgottenPasswordEntity.create(data as ForgottenPasswordEntity);

    return this.forgottenPasswordRepository.save(userForgotPassword);
  }

  public async createForgottenPasswordToken(user: UserEntity) {
    const token = this.jwtService.generateToken({
      email: user.email,
      roles: user.roles,
      userId: user.id
    });
    const newTimestamp = new Date();

    if (!user.forgottenPassword) {
      return await this.saveForgottenPasswordToken({
        token: token.accessToken,
        timestamp: newTimestamp,
      });
    }
    const elapsedTime = isElapsedTime(user.forgottenPassword.timestamp);
    if (elapsedTime) {
      // TODO: Add exception with returned timestamp
      throw new Error('Email sent recently');
    } else {
      return await this.saveForgottenPasswordToken({
        id: user.forgottenPassword.id,
        token: token.accessToken,
        timestamp: newTimestamp,
      });
    }
  }
}
