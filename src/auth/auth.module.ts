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
import {TypeOrmModule} from "@nestjs/typeorm";
import {Tokens} from "~/auth/entity/tokens.entity";
import {EncryptionService} from "~/auth/EncryptionService";

@Module({
  imports: [
    UsersModule,
    EmailModule,
    PassportModule.register({
      defaultStrategy: 'jwt',
      property: 'user',
      session: false,
    }),
    TypeOrmModule.forFeature([
      Tokens
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
  providers: [AuthService, JWTService, JwtStrategy, JwtStrategy, EncryptionService],
  exports: [AuthService, JwtStrategy, JwtStrategy, JWTService, EncryptionService],
})
export class AuthModule {}
