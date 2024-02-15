import { MailerService } from '@nestjs-modules/mailer';
import { ISendMailOptions } from '@nestjs-modules/mailer/dist/interfaces/send-mail-options.interface';
import { BadRequestException, Inject, Injectable, forwardRef } from "@nestjs/common";
import { join } from 'path';
import { SentMessageInfo } from 'nodemailer';
import {ConfigService} from "@nestjs/config";

import { UsersService } from '@user/users.service';

import { EmailVerificationService } from "~/email/email-verification.service";
import {ConfigEnum, ProjectConfig} from "~/config/main-config";
import {SmtpConfig} from "~/config/smtp.config";
import {EmailServiceException} from "~/common/exceptions/email-service-exception";

@Injectable()
export class EmailService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,

    @Inject(forwardRef(() => EmailVerificationService))
    private readonly mailService: EmailVerificationService
  ) {}

  public async sendEmail(mailOptions: ISendMailOptions): Promise<SentMessageInfo> {
    const options = {
      ...mailOptions,
    };

    return await this.mailerService.sendMail(options).catch(error=> {
      throw new EmailServiceException(error, options)
    })
  }

  async testSend(email: string) {
      const {address, name} = this.configService.get<SmtpConfig>(ConfigEnum.SMTP)
      const context = {
        emailToken: 222,
        baseURl: this.configService.get<ProjectConfig>(ConfigEnum.PROJECT).frontendHost,
        email,
      };
      const mailOptions = {
        from: address,
        sender: name,
        to: email, // list of receivers (separated by ,)
        subject: 'Confirm you account on Camp desk',
        message: 'Confirm registration',
        template: join(__dirname, 'templates/confirmation'),
        context,
      };
      return await this.sendEmail(mailOptions);
  }

  public async sendEmailVerification(email: string, token: string): Promise<SentMessageInfo> {
      const {address, name} = this.configService.get<SmtpConfig>(ConfigEnum.SMTP)
      const clientHost = this.configService.get<string>(ConfigEnum.FRONTEND_HOST)
      const context = {
          emailToken: token,
          baseURl: clientHost,
          email: email,
        };
        const mailOptions = {
          from: address,
          sender: name,
          to: email, // list of receivers (separated by ,)
          subject: 'Confirm you account on <YOUR APP>',
          message: 'Confirm registration',
          template: join(__dirname, 'templates/confirmation'),
          context,
        };
        return await this.sendEmail(mailOptions);
  }

  public async sendSuccessRegistrationEmail(email: string) {
    const {address, name} = this.configService.get<SmtpConfig>(ConfigEnum.SMTP)
    const clientUrl = this.configService.get<ProjectConfig>(ConfigEnum.PROJECT).frontendHost;
    const mailOptions = {
      from: address,
      sender: name,
      to: email,
      subject: 'Success registration',
      message: 'Congrats with success registration',
      template: join(__dirname, 'templates/success-registration'),
      context: {clientUrl},
    };
    await this.sendEmail(mailOptions)
  }

  public async sendEmailForgotPassword(email: string): Promise<SentMessageInfo> {
    const smtpConfig = this.configService.get<SmtpConfig>(ConfigEnum.SMTP);
    const projectConfig = this.configService.get<ProjectConfig>(ConfigEnum.PROJECT);
    const user = await this.usersService.findByEmail(email, { forgottenPassword: true });

    if (!user || !user.forgottenPassword) {
      throw new BadRequestException(`User doesn't exist or forgotten password token is missing.`);
    }
    const tokenModel = await this.mailService.validateResetPasswordToken(user.forgottenPassword);
    const targetLink = `${projectConfig.frontendHost}/api/v1/auth/reset-password/${tokenModel.token}`;

    const mailOptions = {
      from: smtpConfig.address,
      sender: smtpConfig.name,
      to: email,
      subject: 'Forgotten password',
      message: 'Forgot password',
      template: join(__dirname, 'templates/forgot-password'),
      context: { targetLink },
    };


    return this.sendEmail(mailOptions);
  }
}
