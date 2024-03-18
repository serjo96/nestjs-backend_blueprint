import {
  Body,
  Controller, Delete,
  Get,
  Param,
  Post,
  Query,
  Redirect,
  UnauthorizedException
} from '@nestjs/common';
import {ApiTags} from '@nestjs/swagger';

import { EmailService } from '~/email/email.service';
import { AuthService } from './auth.service';

import { CreateUserDto } from '@user/dto/create-user.dto';
import { LoginByEmail } from './dto/login.dto';
import {ConfigService} from "@nestjs/config";
import {ConfigEnum, ProjectConfig} from "~/config/main-config";
import {UsersService} from "@user/users.service";
import {VerificationService} from "~/auth/verification.service";
import {UserWithToken} from "~/auth/dto/tokens.dto";
import {RedirectException} from "~/common/exceptions/RedirectException";
import {BadRequestException} from "~/common/exceptions/bad-request";
import {ApiResendVerificationDocs} from "~/auth/api-docs/api-resend-verification-docs";
import {ApiConfirmRegistrationDocs, ApiRegistrationDocs} from "~/auth/api-docs/api-registration-docs";
import {ApiLoginDocs, ApiLoginTokenDocs} from "~/auth/api-docs/api-login.docs";
import {ApiRefreshTokenDocs} from "~/auth/api-docs/api-refresh-token.docs";
import {ApiLogoutDocs} from "~/auth/api-docs/api-logout.docs";
import {ApiForgotPasswordDocs, ApiResetPasswordDocs} from "~/auth/api-docs/api-reset-password.docs";

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
  @ApiRegistrationDocs()
  public async register(@Body() createUserDto: CreateUserDto): Promise<UserWithToken> {
    const userData = await this.authService.register(createUserDto);

    const verificationEntity = await this.verificationService.createVerificationToken(userData.user);
    await this.emailService.sendEmailVerification(userData.user.email, verificationEntity.token);
    await this.verificationService.saveEmailVerification(verificationEntity)
    return userData
  }

  @Post('/login')
  @ApiLoginDocs()
  public async login(@Body() login: LoginByEmail) {
    const user = await this.authService.validateUserByPassword(login);
    const loginResult = await this.authService.login(login, user);

    //logging user activity
    await this.userService.setUserLastActivity(loginResult.user.id)
    return loginResult;
  }

  @Get('/token-login')
  @ApiLoginTokenDocs()
  public async loginWithTempToken(@Query('tempToken') tempToken: string): Promise<UserWithToken> {
    const userId = this.authService.verifyTempToken(tempToken);
    if (!userId) {
      throw new UnauthorizedException('Invalid or expired temporary token.');
    }

    const user = await this.userService.findOne({ id: userId });
    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    const { accessToken, refreshToken } = this.authService.generateUserTokens({
      email: user.email,
      userId: user.id,
      roles: user.roles
    });

    //logging user activity
    await this.userService.setUserLastActivity(user.id)
    return {
      user,
      token: {
        accessToken,
        refreshToken
      }
    }
  }

  @Post('/refresh-token')
  @ApiRefreshTokenDocs()
  public async updateAccessToken(@Body('refreshToken') refreshToken: string): Promise<{ accessToken: string, refreshToken: string }> {
    const tokenData = await this.authService.refreshAccessToken(refreshToken);
    return {
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken
    };
  }

  @Delete('/logout')
  @ApiLogoutDocs()
  public async logout(@Body('refreshToken') refreshToken: string) {
    await this.authService.logout(refreshToken);
    return true;
  }

  @Get('/forgot-password/:email')
  @ApiForgotPasswordDocs()
  public async requestPasswordReset(@Param() { email }: { email: string }) {
    await this.verificationService.initiatePasswordResetProcess(email);
    return 'ok'
  }

  @Get('/reset-password/:token')
  @ApiResetPasswordDocs()
  @Redirect()
  public async resetPassword(@Param() { token }: { token: string }) {
    const host = this.configService.get<ProjectConfig>(ConfigEnum.PROJECT).frontendHost
    try {
      const userEntity = await this.verificationService.verifyForgotPasswordToken(token)
      const newPassword = await this.authService.resetPassword(userEntity)
      const temporaryToken = this.authService.generateTemporaryToken(userEntity.id)

      await this.verificationService.deleteForgottenPassword({token});
      await this.emailService.sendResetPasswordEmail(userEntity.email, newPassword)

      return { url: `${host}/login?&token=${temporaryToken}` }
    } catch (error) {
      throw new RedirectException(error, `${host}/error`)
    }
  }

  @Get('/resend-verification/:email')
  @ApiResendVerificationDocs()
  public async sendEmailVerification(@Param() { email }: { email: string }) {
    const user = await this.userService.findVerifiedUserByEmail(email);
    if (user.confirmed) {
      throw new BadRequestException('User already verified.');
    }
    const verificationEntity = await this.verificationService.manageVerificationToken(user);

    await this.emailService.sendEmailVerification(email, verificationEntity.token);
    await this.verificationService.saveEmailVerification(verificationEntity)
    return 'ok'
  }

  @Get('/confirm/:token')
  @ApiConfirmRegistrationDocs()
  @Redirect()
  public async confirmRegistration(
    @Param() { token }: { token: string },
  ) {
    const redirectLink = this.configService.get<ProjectConfig>(ConfigEnum.PROJECT).frontendHost
    try {
      const userEmail = await this.verificationService.verifyConfirmToken(token);
      await this.emailService.sendSuccessRegistrationEmail(userEmail);
      return {url: redirectLink}
    } catch (error) {
      throw new RedirectException(error, `${redirectLink}/error`)
    }
  }
}
