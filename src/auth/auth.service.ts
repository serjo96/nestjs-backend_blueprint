import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

import { CreateUserDto } from '@user/dto/create-user.dto';
import { UsersService } from '@user/users.service';
import { EmailService } from '~/email/email.service';
import { VerificationService } from "~/email/verification.service";

import {JwtPayload, JWTService} from './jwt.service';
import { UserWithToken } from './interfaces/user-with-token.interface';
import { LoginByEmail } from './dto/login.dto';
import {RefreshToken} from "~/auth/entity/refresh-token.entity";
import {UserEntity} from "@user/users.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {DatabaseError} from "~/common/exceptions/DatabaseError";

export interface ValidateUserByPasswordPayload {
  email: string;
  password: string;
}

type SaveUserToken = {
  refreshToken: string,
  user: UserEntity,
  expiresIn: Date
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JWTService,
    private readonly mailService: VerificationService,
    private readonly emailService: EmailService,

    @InjectRepository(RefreshToken)
    private readonly refreshTokensRepository: Repository<RefreshToken>
  ) {}

  private saveUserToken({refreshToken, user, expiresIn}: SaveUserToken) {
    const tokenPayload = this.refreshTokensRepository.create({
      token: refreshToken,
      user,
      expiresIn
    })
    return this.refreshTokensRepository.save(tokenPayload).catch(err => {
      throw new DatabaseError(err.message);
    })
  }

  private deleteToken(refreshToken: string) {
    return this.refreshTokensRepository.delete({token: refreshToken})
  }

  private generateRandomPassword(length: number = 12): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+=';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  private async comparePassword(attempt: string, dbPassword: string): Promise<boolean> {
    return await bcrypt.compare(attempt, dbPassword);
  }

  private async validateUserByPassword({ email, password }: ValidateUserByPasswordPayload) {
    // find if user exist with this email
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new BadRequestException({ message: `User doesn't exist` });
    }

    // find if user password match
    const match = await this.comparePassword(password, user.password);
    if (!match) {
      throw new UnauthorizedException();
    }

    return user;
  }

  public async register(userDto: CreateUserDto): Promise<UserWithToken> {
    const user = await this.userService.create(userDto);
    const token = this.generateUserTokens({
      email: user.email,
      userId: user.id,
      roles: user.roles
    });

    await this.saveUserToken({
      user,
      expiresIn: token.expireDateRefreshToken,
      refreshToken: token.refreshToken
    })

    return {
      user,
      token,
    };
  }

  public async login(loginUserDto: LoginByEmail): Promise<UserWithToken> {
    const user = await this.validateUserByPassword(loginUserDto);

    const {accessToken, refreshToken} = this.generateUserTokens({
      email: user.email,
      userId: user.id,
      roles: user.roles
    });

    return {
      user: user,
      token: {
        accessToken,
        refreshToken
      },
    };
  }

  public generateUserTokens(payload: JwtPayload) {
    return this.jwtService.generateToken(payload)
  }

  public generateTemporaryToken(userId: string) {
    return this.jwtService.generateTemporaryAuthToken(userId);
  }

  public verifyTempToken(token: string) {
    try {
      const payload = this.jwtService.verifyToken(token);
      return payload.userId;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired temporary token.');
    }
  }

  public async resetPassword(user: UserEntity): Promise<string> {
    const password = this.generateRandomPassword();

    //At user entity have orm hook before update where we hash our password
    await this.userService.updateUser(user.id, { password });
    return password;
  }

  public async refreshAccessToken(refreshToken: string): Promise<string> {
    const decodedToken = this.jwtService.verifyToken(refreshToken, false);

    // Checking whether the token is in the database and whether it has expired
    const tokenEntity = await this.refreshTokensRepository.findOne({
      where: {
        token: refreshToken
      } });
    if (!tokenEntity || new Date() > tokenEntity.expiresIn) {
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }

    // Removing the used Refresh token from the database
    await this.deleteToken(refreshToken);

    // Generating a new Access token
    return this.jwtService.generateToken(decodedToken).accessToken;;
  }
}
