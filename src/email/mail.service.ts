import { BadRequestException, Inject, Injectable, forwardRef } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserEntity } from '@user/users.entity';
import { UsersService } from '@user/users.service';

import { ForgottenPasswordEntity } from '~/auth/forgottenPassword.entity';
import { JWTService } from '~/auth/jwt.service';
import { EmailService } from '~/email/email.service';
import { isElapsedTime } from '~/utils/isElapsedTime';
import { GetRepositoryMethodsArgs } from '~/utils/typeUtils/getRepositoryMethodsArgs';

import { EmailVerificationEntity } from './email-verification.entity';
import {ConfigService} from "@nestjs/config";

@Injectable()
export class MailService {
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
  ) {}

  public findOneBy(where: GetRepositoryMethodsArgs<EmailVerificationEntity, 'where'>[0]): Promise<EmailVerificationEntity | null> {
    return this.emailVerificationRepository.findOneBy(where);
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
    let entity = data;
    if (!(entity instanceof EmailVerificationEntity)) {
      entity = EmailVerificationEntity.create(data as EmailVerificationEntity);
    }

    return this.emailVerificationRepository.save(entity);
  }

  public async createEmailToken(email: string): Promise<boolean> {
    const emailVerification = await this.findOneBy({ email });
    const elapsedTime = emailVerification && isElapsedTime(emailVerification.timestamp);

    if (emailVerification && elapsedTime) {
      // TODO: Add exception with returned timestamp
      throw new BadRequestException('Email sent recently');
    } else {
      const emailToken = this.jwtService.createToken();

      try {
        await this.saveEmailVerification({
          email,
          emailToken,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error(error);
      }
    }
    return true;
  }

  public async verifyEmail(token: string): Promise<UserEntity> {
    const verifiedEmailAddress = await this.findOneBy({ emailToken: token });

    if (verifiedEmailAddress && verifiedEmailAddress.email) {
      const userFromDb = await this.usersService.findOne({
        email: verifiedEmailAddress.email,
      });
      if (userFromDb) {
        userFromDb.confirmed = true;
        const savedUser = await userFromDb.save();
        await verifiedEmailAddress.remove();
        // await this.emailService.sendSuccessRegistrationEmail(verifiedEmailAddress.email);
        return savedUser;
      }
    } else {
      throw new Error('Email token not valid');
    }
  }

  public saveForgottenPasswordToken(data: { id?: string; token: string; timestamp: Date }) {
    const userForgotPassword = ForgottenPasswordEntity.create(data as ForgottenPasswordEntity);

    return this.forgottenPasswordRepository.save(userForgotPassword);
  }

  public async createForgottenPasswordToken(forgottenPassword?: ForgottenPasswordEntity) {
    const token = this.jwtService.createToken();
    const newTimestamp = new Date();

    if (!forgottenPassword) {
      return await this.saveForgottenPasswordToken({
        token,
        timestamp: newTimestamp,
      });
    }
    const elapsedTime = isElapsedTime(forgottenPassword.timestamp);
    if (elapsedTime) {
      // TODO: Add exception with returned timestamp
      throw new Error('Email sent recently');
    } else {
      return await this.saveForgottenPasswordToken({
        id: forgottenPassword.id,
        token,
        timestamp: newTimestamp,
      });
    }
  }
}