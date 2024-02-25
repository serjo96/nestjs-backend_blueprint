import { MailerService } from '@nestjs-modules/mailer';
import { ISendMailOptions } from '@nestjs-modules/mailer/dist/interfaces/send-mail-options.interface';
import { Injectable } from "@nestjs/common";
import { join } from 'path';
import { SentMessageInfo } from 'nodemailer';
import {ConfigService} from "@nestjs/config";

import { UsersService } from '@user/users.service';

import {ConfigEnum, ProjectConfig} from "~/config/main-config";
import {SmtpConfig} from "~/config/smtp.config";
import {EmailServiceException} from "~/common/exceptions/email-service-exception";

@Injectable()
export class EmailService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
  ) {}

  public async sendEmail(mailOptions: ISendMailOptions): Promise<SentMessageInfo> {
    const {address, name} = this.configService.get<SmtpConfig>(ConfigEnum.SMTP)
    const options = {
      from: address,
      sender: name,
      ...mailOptions,
    };

    return await this.mailerService.sendMail(options).catch(error=> {
      throw new EmailServiceException(error, options)
    })
  }

  public async testSend(email: string) {
      const context = {
        emailToken: 222,
        baseURl: this.configService.get<ProjectConfig>(ConfigEnum.PROJECT).frontendHost,
        email,
      };
      const mailOptions = {
        to: email,
        subject: 'Confirm you account on <YOUR APP>',
        message: 'Confirm registration',
        template: join(__dirname, 'templates/confirmation'),
        context,
      };
      return await this.sendEmail(mailOptions);
  }

  public async sendEmailVerification(email: string, token: string) {
    const {baseHost} = this.configService.get<ProjectConfig>(ConfigEnum.PROJECT)
    const context = {
      emailToken: token,
      baseURl: baseHost,
      email: email,
    };
    const mailOptions = {
      to: email, // list of receivers (separated by ,)
      subject: 'Confirm you account on <YOUR APP>',
      message: 'Confirm registration',
      template: join(__dirname, 'templates/confirmation'),
      context,
    };

    return this.sendEmail(mailOptions);
  }

  public async sendSuccessRegistrationEmail(email: string) {
    const clientUrl = this.configService.get<ProjectConfig>(ConfigEnum.PROJECT).frontendHost;
    const mailOptions = {
      to: email,
      subject: 'Success registration',
      message: 'Congrats with success registration',
      template: join(__dirname, 'templates/success-registration'),
      context: {clientUrl},
    };
    return this.sendEmail(mailOptions)
  }

  public async sendEmailForgotPassword(email: string, token: string) {
    const projectConfig = this.configService.get<ProjectConfig>(ConfigEnum.PROJECT);
    const targetLink = `${projectConfig.baseHost}/api/v1/auth/reset-password/${token}`;

    const mailOptions = {
      to: email,
      subject: 'Forgotten password',
      message: 'Forgot password',
      template: join(__dirname, 'templates/forgot-password'),
      context: { targetLink },
    };

    return this.sendEmail(mailOptions);
  }

  public async sendResetPasswordEmail(email: string, password: string){
    const mailOptions = {
      to: email,
      subject: 'Reset password',
      message: 'Reset password',
      template: join(__dirname, 'templates/new-password'),
      context: { password },
    };

    return this.sendEmail(mailOptions);
  }
}
