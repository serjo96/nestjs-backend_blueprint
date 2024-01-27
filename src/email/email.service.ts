import { MailerService } from '@nestjs-modules/mailer';
import { ISendMailOptions } from '@nestjs-modules/mailer/dist/interfaces/send-mail-options.interface';
import { BadRequestException, Inject, Injectable, forwardRef } from "@nestjs/common";
import { join } from 'path';
import { SentMessageInfo } from 'nodemailer';
import {ConfigService} from "@nestjs/config";

import { UsersService } from '@user/users.service';

import { MailService } from "~/email/mail.service";
import {ConfigEnum, ProjectConfig} from "~/config/main-config";
import {SmtpConfig} from "~/config/smtp.config";

@Injectable()
export class EmailService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,

    @Inject(forwardRef(() => MailService))
    private readonly mailService: MailService
  ) {}

  public async sendEmail(mailOptions: ISendMailOptions): Promise<SentMessageInfo> {
    const options = {
      ...mailOptions,
    };

    return await this.mailerService.sendMail(options);
  }

  async testSend(email: string) {
    try {
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
    } catch (error) {
      console.error(error);
    }
  }

  public async sendEmailVerification(email: string): Promise<SentMessageInfo> {
    try {
      const {address, name} = this.configService.get<SmtpConfig>(ConfigEnum.SMTP)

      const emailCode = await this.mailService.findOneBy({
        where: {
          email,
        },
      });

      if (emailCode && emailCode.emailToken) {
        const context = {
          emailToken: emailCode.emailToken,
          baseURl: this.configService.get<string>('frontendHost'),
          email: email,
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
      } else {
        throw new BadRequestException();
      }
    } catch (error) {
      console.error(error);
    }
  }

  public async sendSuccessRegistrationEmail(email: string) {
    try {
      const {address, name} = this.configService.get<SmtpConfig>(ConfigEnum.SMTP)
      const context = {
        clientUrl: this.configService.get<ProjectConfig>(ConfigEnum.PROJECT).frontendHost,
      };
      const mailOptions = {
        from: address,
        sender: name,
        to: email, // list of receivers (separated by ,)
        subject: 'Success registration',
        message: 'Congrats with success registration',
        template: join(__dirname, 'templates/success-registration'),
        context,
      };
      await this.sendEmail(mailOptions);
    } catch (error) {
      console.error(error);
    }
  }

  public async sendEmailForgotPassword(email: string): Promise<SentMessageInfo> {
    const {address, name} = this.configService.get<SmtpConfig>(ConfigEnum.SMTP)
    const user = await this.usersService.findByEmail(email, {
      forgottenPassword: true,
    });

    if (!user) {
      throw new BadRequestException(`User doesn't exist`);
    }
    const tokenModel = await this.mailService.createForgottenPasswordToken(user.forgottenPassword);

    const context = {
      targetLink: `${this.configService.get<ProjectConfig>(ConfigEnum.PROJECT).frontendHost}/api/v1/auth/reset-password/${tokenModel.token}`,
    };
    const mailOptions = {
      from: address,
      sender: name,
      to: email, // list of receivers (separated by ,)
      subject: 'Forgotten password',
      message: 'Forgot password',
      template: join(__dirname, 'templates/forgot-password'),
      context,
    };

    return this.sendEmail(mailOptions);
  }
}
