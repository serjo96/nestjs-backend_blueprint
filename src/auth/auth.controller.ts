import {Body, Controller, Get, HttpCode, HttpStatus, Logger, NotFoundException, Param, Post, Redirect} from '@nestjs/common';
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
import {UsersService} from "@user/users.service";

@ApiTags('auth')
@Controller('/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
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

    const verificationEntity = await this.mailService.createVerificationToken(userData.user);
    await this.emailService.sendEmailVerification(userData.user.email, verificationEntity.token);
    await this.mailService.saveEmailVerification(verificationEntity)
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
      forgottenPasswordEntity = await this.mailService.createForgottenPasswordToken(user)
    } else {
      forgottenPasswordEntity = this.mailService.validateToken(user.forgottenPassword);
    }

    await this.emailService.sendEmailForgotPassword(email, forgottenPasswordEntity.token);
    await this.mailService.saveForgottenPasswordToken(forgottenPasswordEntity)
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
    this.mailService.validateToken(forgottenPasswordEntity);

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
      verificationEntity = await this.mailService.createVerificationToken(user)
    } else {
      verificationEntity = this.mailService.validateToken(user.forgottenPassword);
      await this.mailService.deleteEmailVerification(user.emailVerification.id)
    }

    await this.emailService.sendEmailVerification(email, verificationEntity.token);
    await this.mailService.saveEmailVerification(verificationEntity)
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
      const userEmail = await this.mailService.verifyEmail(token);
      await this.emailService.sendSuccessRegistrationEmail(userEmail);
    } catch (error) {
      logger.error(`Error during email confirmation: ${error.message}`, error.stack);
      redirectUrl += '/resend-conformation'
    }
    return {url: redirectUrl}
  }
}
