import { MailerService } from '@nestjs-modules/mailer';
import { ISendMailOptions } from '@nestjs-modules/mailer/dist/interfaces/send-mail-options.interface';
import { Inject, Injectable, forwardRef } from "@nestjs/common";
import { join } from 'path';
import { SentMessageInfo } from 'nodemailer';
import {ConfigService} from "@nestjs/config";

import { UsersService } from '@user/users.service';

import { VerificationService } from "~/email/verification.service";
import {ConfigEnum, ProjectConfig} from "~/config/main-config";
import {SmtpConfig} from "~/config/smtp.config";
import {EmailServiceException} from "~/common/exceptions/email-service-exception";

@Injectable()
export class EmailService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,

    @Inject(forwardRef(() => VerificationService))
    private readonly verificationService: VerificationService
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
      const {baseHost} = this.configService.get<ProjectConfig>(ConfigEnum.PROJECT)
      const context = {
          emailToken: token,
          baseURl: baseHost,
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

  public async sendEmailForgotPassword(email: string, token: string): Promise<SentMessageInfo> {
    const smtpConfig = this.configService.get<SmtpConfig>(ConfigEnum.SMTP);
    const projectConfig = this.configService.get<ProjectConfig>(ConfigEnum.PROJECT);
    const targetLink = `${projectConfig.baseHost}/api/v1/auth/reset-password/${token}`;

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
