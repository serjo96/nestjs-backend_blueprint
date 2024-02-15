import {Body, Controller, Get, HttpCode, HttpException, HttpStatus, Param, Post, Redirect, Res} from '@nestjs/common';
import {ApiOkResponse, ApiParam, ApiResponse, ApiTags} from '@nestjs/swagger';

import { BadRequestException } from '~/common/exceptions/bad-request';

import { EmailService } from '~/email/email.service';
import { EmailVerificationService } from "~/email/email-verification.service";
import { AuthService } from './auth.service';

import { CreateUserDto } from '@user/dto/create-user.dto';
import { LoginByEmail } from './dto/login.dto';
import { UserWithToken } from './interfaces/user-with-token.interface';
import {ConfigService} from "@nestjs/config";
import {ConfigEnum, ProjectConfig} from "~/config/main-config";
import {Response} from "express";

@ApiTags('auth')
@Controller('/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly emailService: EmailService,
    private readonly mailService: EmailVerificationService,
    private readonly configService: ConfigService,
  ) {}

  @Post('/sign-up')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'A user has been successfully registration',
    type: UserWithToken,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  public async register(@Body() createUserDto: CreateUserDto): Promise<UserWithToken> {
    const userData = await this.authService.register(createUserDto);

    const emailToken = await this.mailService.createEmailToken(userData.user.email);
    await this.emailService.sendEmailVerification(userData.user.email, emailToken);
    return userData
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
  public sendEmailForgotPassword(@Param() { email }: { email: string }) {
    return this.emailService.sendEmailForgotPassword(email);
  }

  @Get('/reset-password/:token')
  @HttpCode(HttpStatus.FOUND)
  @ApiParam({
    name: 'Token',
    description: 'Token for reset password',
    type: 'string',
  })
  @Redirect()
  public async resetPassword(@Param() { token }: { token: string }) {
    const forgottenPasswordEntity = await this.mailService.findForgottenPasswordUser({ token });
    const host = this.configService.get<ProjectConfig>(ConfigEnum.PROJECT).frontendHost

    //TODO: Move logic in email service
    if (forgottenPasswordEntity) {
      // TODO: Add generate new password
      await this.mailService.deleteForgottenPassword({
        token,
      });
      return {
        url: `${host}/auth/reset-password?changePass=true&token=${token}`
      }
    } else {
      throw new BadRequestException("Token doesn't exists");
    }
  }

  @Get('/confirm/:token')
  @HttpCode(HttpStatus.OK)
  @ApiParam({
    name: 'token',
    description: 'Token for confirm registration',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.PERMANENT_REDIRECT,
    description: 'Redirects to frontend app',
  })
  public async confirmRegistration(
    @Param() { token }: { token: string },
    @Res() response: Response
  ) {
    const userEmail = await this.mailService.verifyEmail(token);
    const redirectUrl = this.configService.get<ProjectConfig>(ConfigEnum.PROJECT).frontendHost

    await this.emailService.sendSuccessRegistrationEmail(userEmail);
    return response.redirect(redirectUrl)
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
