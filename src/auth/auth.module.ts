import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { UsersModule } from '@user/users.module';

import { EmailModule } from '../email/email.module';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JWTService } from './jwt.service';
import { JwtStrategy } from './passport/jwt.strategy';
import {ConfigModule, ConfigService} from "@nestjs/config";
import {ConfigEnum} from "~/config/main-config";
import {AuthConfig} from "~/config/auth.config";

@Module({
  imports: [
    UsersModule,
    EmailModule,
    PassportModule.register({
      defaultStrategy: 'jwt',
      property: 'user',
      session: false,
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<AuthConfig>(ConfigEnum.AUTH).jwt_secret_key,
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JWTService, JwtStrategy, JwtStrategy],
  exports: [AuthService, JwtStrategy, JwtStrategy, JWTService],
})
export class AuthModule {}
