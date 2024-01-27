import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { JWTService } from '~/auth/jwt.service';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { EmailService } from '../email/email.service';
import { EmailServiceMock } from '../email/email.service.mock';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthServiceMock } from './auth.service.mock';

describe('Auth Controller', () => {
  let controller: AuthController;

  const AuthServiceProvider = {
    provide: AuthService,
    useClass: AuthServiceMock,
  };

  const EmailServiceProvider = {
    provide: EmailService,
    useClass: EmailServiceMock,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.registerAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: async (configService: ConfigService) => ({
            secret: configService.jwtConfig.secretCode,
          }),
        }),
      ],
      controllers: [AuthController],
      providers: [AuthServiceProvider, EmailServiceProvider, JWTService],
      exports: [JWTService],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
