import {Body, Controller, Get, HttpCode, HttpStatus, Logger, NotFoundException, Param, Post, Redirect} from '@nestjs/common';
import {ApiOkResponse, ApiParam, ApiResponse, ApiTags} from '@nestjs/swagger';

import { BadRequestException } from '~/common/exceptions/bad-request';

import { EmailService } from '~/email/email.service';
import { VerificationService } from "~/email/verification.service";
import { AuthService } from './auth.service';

import { CreateUserDto } from '@user/dto/create-user.dto';
import { LoginByEmail } from './dto/login.dto';
import { UserWithToken } from './interfaces/user-with-token.interface';
import {ConfigService} from "@nestjs/config";
import {ConfigEnum, ProjectConfig} from "~/config/main-config";
import {UsersService} from "@user/users.service";

@ApiTags('auth')
@Controller('/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
    private readonly emailService: EmailService,
    private readonly verificationService: VerificationService,
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

    const verificationEntity = await this.verificationService.createVerificationToken(userData.user);
    await this.emailService.sendEmailVerification(userData.user.email, verificationEntity.token);
    await this.verificationService.saveEmailVerification(verificationEntity)
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
  @ApiOkResponse({
    description: 'Email for reset password',
    type: 'string',
  })
  @ApiResponse({
    description: 'Returns unix time before unlock attempt, if email sent recently',
    status: HttpStatus.TOO_MANY_REQUESTS,
    type: TokenValidationErrorDto
  })
  public async sendEmailForgotPassword(@Param() { email }: { email: string }) {
    const user = await this.userService.findByEmail(email, { forgottenPassword: true });
    let forgottenPasswordEntity = null;
    if (!user) {
      throw new NotFoundException(`User doesn't exist`);
    }

    if(!user.forgottenPassword) {
      forgottenPasswordEntity = await this.verificationService.createForgottenPasswordToken(user)
    } else {
      forgottenPasswordEntity = this.verificationService.validateToken(user.forgottenPassword);
    }

    await this.emailService.sendEmailForgotPassword(email, forgottenPasswordEntity.token);
    await this.verificationService.saveForgottenPasswordToken(forgottenPasswordEntity)
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
    const userEntity = await this.verificationService.verifyForgotPasswordToken(token)
    const host = this.configService.get<ProjectConfig>(ConfigEnum.PROJECT).frontendHost

    const newPassword = this.authService.resetPassword(userEntity)
    await this.verificationService.deleteForgottenPassword({
      token,
    });
    return {
      url: `${host}/auth/reset-password?changePass=true&token=${token}`
    }
  }

  @Get('/resend-verification/:email')
  @ApiParam({
    name: 'email',
    description: 'Email for resend verification',
    type: 'string',
  })
  @ApiOkResponse({
    description: 'At success operation returns string "ok"'
  })
  @ApiResponse({
    description: 'Returns unix time before unlock attempt, if email sent recently',
    status: HttpStatus.TOO_MANY_REQUESTS,
    type: TokenValidationErrorDto
  })
  public async sendEmailVerification(@Param() { email }: { email: string }) {
    const user = await this.userService.findByEmail(email, { emailVerification: true });
    let verificationEntity = null;
    if (!user) {
      throw new NotFoundException(`User doesn't exist`);
    }

    if(!user.forgottenPassword) {
      verificationEntity = await this.verificationService.createVerificationToken(user)
    } else {
      verificationEntity = this.verificationService.validateToken(user.forgottenPassword);
      await this.verificationService.deleteEmailVerification(user.emailVerification.id)
    }

    await this.emailService.sendEmailVerification(email, verificationEntity.token);
    await this.verificationService.saveEmailVerification(verificationEntity)
    return 'ok'
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
  @Redirect()
  public async confirmRegistration(
    @Param() { token }: { token: string },
  ) {
    let redirectUrl = this.configService.get<ProjectConfig>(ConfigEnum.PROJECT).frontendHost
    const logger = new Logger(AuthController.name);

    try {
      const userEmail = await this.verificationService.verifyConfirmToken(token);
      await this.emailService.sendSuccessRegistrationEmail(userEmail);
    } catch (error) {
      logger.error(`Error during email confirmation: ${error.message}`, error.stack);
      redirectUrl += '/resend-conformation'
    }
    return {url: redirectUrl}
  }
}
