import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common'
import {ConfigModule, ConfigService} from "@nestjs/config";
import { join } from 'path';

import { UsersModule } from '@user/users.module';

import { EmailService } from './email.service';
import {SmtpConfig} from "~/config/smtp.config";
import {ConfigEnum} from "~/config/main-config";

@Module({
  imports: [
    UsersModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const { host, port, login, password } = configService.get<SmtpConfig>(ConfigEnum.SMTP);
        return {
          // transport: 'smtps://user@example.com:topsecret@smtp.example.com',
          // or
          transport: {
            host,
            port,
            secure: false,
            auth: {
              user: login,
              pass: password,
            },
          },
          defaults: {
            from: `"No Reply"`,
          },
          template: {
            dir: join(__dirname, 'templates'),
            adapter: new HandlebarsAdapter(undefined, {
              inlineCssEnabled: true,
            }), // or new PugAdapter() or new EjsAdapter()
            options: {
              strict: true,
            },
          },
        };
      },
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
