import { Module } from '@nestjs/common';
import {ThrottlerModule} from "@nestjs/throttler";
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';
import pinoLoggerConfig from "~/config/pino-logger.config";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {ConfigEnum, mainConfig} from "~/config/main-config";
import {validationSchema} from "~/config/validation";
import {isProd} from "~/utils/envType";

@Module({
  imports: [
    ConfigModule,
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      load: [mainConfig],
      isGlobal: true,
      validationSchema,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => config.get(ConfigEnum.DATABASE).options,
    }),
    AuthModule,
    EmailModule,
    LoggerModule.forRootAsync({
      useFactory: async () => pinoLoggerConfig
    }),
    ...!isProd
      ? [
    ThrottlerModule.forRoot({
      throttlers: [{
        ttl: 60, // time in seconds for which the limit is calculated
        limit: 10, // maximum number of requests during TTL
      }]
    }),
  ] : []],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
