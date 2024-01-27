import { Body, Controller, Get, HttpCode, HttpException, HttpStatus, Param, Post, Redirect } from '@nestjs/common';
import { ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { BadRequestException } from '~/common/exceptions/bad-request';

import { EmailService } from '~/email/email.service';
import { MailService } from "~/email/mail.service";
import { AuthService } from './auth.service';

import { CreateUserDto } from '@user/dto/create-user.dto';
import { LoginByEmail } from './dto/login.dto';
import { UserWithToken } from './interfaces/user-with-token.interface';
import {ConfigService} from "@nestjs/config";
import {ConfigEnum, ProjectConfig} from "~/config/main-config";

@ApiTags('auth')
@Controller('/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly emailService: EmailService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  @Post('/register')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'A user has been successfully registration',
    type: UserWithToken,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  public async register(@Body() createUserDto: CreateUserDto): Promise<UserWithToken> {
    try {
      return await this.authService.register(createUserDto);
    } catch (error) {
      console.log(error);
      throw new HttpException(error.message, error.code || HttpStatus.BAD_REQUEST);
    }
  }

  @Post('/login')
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @ApiParam(LoginByEmail)
  @HttpCode(HttpStatus.OK)
  public async login(@Body() login: LoginByEmail) {
    return await this.authService.login(login);
  }

  @Get('/forgot-password/:email')
  @ApiParam({
    name: 'email',
    description: 'Email for reset password',
    type: 'string',
  })
  @HttpCode(HttpStatus.OK)
  public async sendEmailForgotPassword(@Param() { email }: { email: string }) {
    /*const isEmailSent = await this.emailService.sendEmailForgotPassword(email);

    if (isEmailSent) {
      return {
        message: 'A confirmation email has been sent to your email, confirm it.',
        confirm: true,
      };
    } else {
      throw new BadRequestException('Mail not sent');
    }*/
  }

  @Get('/reset-password/:token')
  @HttpCode(HttpStatus.FOUND)
  @ApiParam({
    name: 'Token',
    description: 'Token for reset password',
    type: 'string',
  })
  @Redirect('/')
  public async resetPassword(@Param() { token }: { token: string }) {
    const forgottenPasswordEntity = await this.mailService.findForgottenPasswordUser({ token });

    //TODO: Move logic in email service
    if (forgottenPasswordEntity) {
      // TODO: Add generate new password
      await this.mailService.deleteForgottenPassword({
        token,
      });
      return `${this.configService.get<ProjectConfig>(ConfigEnum.PROJECT).frontendHost}/auth/reset-password?changePass=true&token=${token}`;
    } else {
      throw new BadRequestException("Token doesn't exists");
    }
  }

  @Get('/confirm/:token')
  @HttpCode(HttpStatus.OK)
  @ApiParam({
    name: 'token',
    description: 'Token for confirm registration',
    type: 'string',
  })
  public async confirmRegistration(@Param() { token }: { token: string }) {
    const { email } = await this.mailService.verifyEmail(token);
    // await this.emailService.sendSuccessRegistrationEmail(email);
  }

  @Get('/resend-verification/:email')
  @ApiParam({
    name: 'email',
    description: 'Email for resend verification',
    type: 'string',
  })
  public async sendEmailVerification(@Param() { email }: { email: string }) {
    console.log(email);
    await this.mailService.createEmailToken(email);
    /*const isEmailSent = await this.emailService.sendEmailVerification(email);
    if (isEmailSent) {
      return 'Email resent';
    } else {
      throw new BadRequestException('Mail not sent');
    }*/
  }
}
