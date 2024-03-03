import {
  Body,
  Controller, Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  Redirect,
  UnauthorizedException
} from '@nestjs/common';
import {ApiBody, ApiOkResponse, ApiParam, ApiResponse, ApiTags} from '@nestjs/swagger';

import { EmailService } from '~/email/email.service';
import { AuthService } from './auth.service';

import { CreateUserDto } from '@user/dto/create-user.dto';
import { LoginByEmail } from './dto/login.dto';
import {ConfigService} from "@nestjs/config";
import {ConfigEnum, ProjectConfig} from "~/config/main-config";
import {UsersService} from "@user/users.service";
import { TokenValidationErrorDto } from '~/common/dto/TokenValidationErrorDto';
import {VerificationService} from "~/auth/verification.service";
import {RefreshTokenDto} from "~/auth/dto/refresh-token.dto";
import {TokensResponse, UserWithToken} from "~/auth/dto/tokens.dto";
import {ErrorValidationDto} from "~/common/dto/error-validation.dto";
import {RedirectException} from "~/common/exceptions/RedirectException";

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
  @ApiOkResponse({
    description: 'A user has been successfully registration',
    type: UserWithToken,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Returns bad request if password is to week or email not pass, or if user already exist.',
    type: ErrorValidationDto
  })
  public async register(@Body() createUserDto: CreateUserDto): Promise<UserWithToken> {
    const userData = await this.authService.register(createUserDto);

    const verificationEntity = await this.verificationService.createVerificationToken(userData.user);
    await this.emailService.sendEmailVerification(userData.user.email, verificationEntity.token);
    await this.verificationService.saveEmailVerification(verificationEntity)
    return userData
  }

  @Post('/login')
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @ApiOkResponse({
    description: 'Return user with tokens at success login.',
    type: UserWithToken
  })
  @ApiBody({
    type: LoginByEmail
  })
  public async login(@Body() login: LoginByEmail) {
    const loginResult = await this.authService.login(login);

    //logging user activity
    await this.userService.setUserLastActivity(loginResult.user.id)
    return loginResult;
  }

  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "If user doesn't exist or invalid token" })
  @ApiOkResponse({
    description: 'Return user with tokens at success login.',
    type: UserWithToken
  })
  @Get('/token-login')
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
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 200,
    description: 'The access token has been refreshed successfully',
    type: TokensResponse
  })
  @ApiResponse({ status: 400, description: 'Invalid refresh token' })
  public async refresh(@Body('refreshToken') refreshToken: string): Promise<{ accessToken: string, refreshToken: string }> {
    const tokenData = await this.authService.refreshAccessToken(refreshToken);
    return {
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken
    };
  }

  @ApiBody({ type: RefreshTokenDto })
  @Delete('/logout')
  public async logout(@Body('refreshToken') refreshToken: string) {
    await this.authService.logout(refreshToken);
    return true;
  }

  @Get('/forgot-password/:email')
  @ApiParam({ name: 'email', required: true, description: 'User email for reset password' })
  @ApiOkResponse({
    description: 'Returns ok iff operation is success.',
    type: String,
  })
  @ApiResponse({
    description: 'Returns unix time before unlock attempt, if email sent recently',
    status: HttpStatus.TOO_MANY_REQUESTS,
    type: TokenValidationErrorDto
  })
  public async requestPasswordReset(@Param() { email }: { email: string }) {
    await this.verificationService.initiatePasswordResetProcess(email);
    return 'ok'
  }

  @Get('/reset-password/:token')
  @ApiParam({ name: 'token', required: true, description: 'Token for reset password' })
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
    const user = await this.userService.findVerifiedUserByEmail(email);
    const verificationEntity = await this.verificationService.manageVerificationToken(user);

    await this.emailService.sendEmailVerification(email, verificationEntity.token);
    await this.verificationService.saveEmailVerification(verificationEntity)
    return 'ok'
  }

  @Get('/confirm/:token')
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
