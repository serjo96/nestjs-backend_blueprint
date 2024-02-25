import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { UsersModule } from '@user/users.module';
import {TypeOrmModule} from "@nestjs/typeorm";

import { EmailModule } from '../email/email.module';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JWTService } from './jwt.service';
import {ConfigModule, ConfigService} from "@nestjs/config";
import {ConfigEnum} from "~/config/main-config";
import {AuthConfig} from "~/config/auth.config";
import {EncryptionService} from "~/auth/EncryptionService";
import {RefreshToken} from "~/auth/entities/refresh-token.entity";
import {VerificationService} from "~/auth/verification.service";
import {ForgottenPasswordEntity} from "~/auth/entities/forgotten-password.entity";
import {EmailVerificationEntity} from "~/auth/entities/email-verification.entity";

@Module({
  imports: [
    UsersModule,
    EmailModule,
    TypeOrmModule.forFeature([
      RefreshToken,
      EmailVerificationEntity,
      ForgottenPasswordEntity
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<AuthConfig>(ConfigEnum.AUTH).jwt_secret_key,
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JWTService, EncryptionService, VerificationService],
  exports: [AuthService, JWTService, EncryptionService, VerificationService],
})
export class AuthModule {}
