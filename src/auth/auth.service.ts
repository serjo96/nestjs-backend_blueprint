import { BadRequestException, HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserDto } from '@user/dto/user.dto';
import * as bcrypt from 'bcryptjs';

import { CreateUserDto } from '@user/dto/create-user.dto';
import { UsersService } from '@user/users.service';
import { EmailService } from '~/email/email.service';
import { EmailVerificationService } from "~/email/email-verification.service";
import { UserClassResponseDto } from './dto/user.dto';

import { JWTService } from './jwt.service';
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
    private readonly mailService: EmailVerificationService,
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

  async validateUserByPassword({ email, password }: ValidateUserByPasswordPayload) {
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


  async comparePassword(attempt: string, dbPassword: string): Promise<boolean> {
    return await bcrypt.compare(attempt, dbPassword);
  }

  async register(userDto: CreateUserDto): Promise<UserWithToken> {
    const user = await this.userService.create(userDto);
    const token = this.jwtService.generateToken({
      email: user.email,
      userId: user.id,
      roles: user.roles
    });
    await this.saveUserToken({user, expiresIn: token.expireDateRefreshToken, refreshToken: token.refreshToken})

    return {
      user: new UserClassResponseDto(user),
      token,
    };
  }

  async login(loginUserDto: LoginByEmail): Promise<UserWithToken> {
    const user = await this.validateUserByPassword(loginUserDto);

    const {accessToken, refreshToken} = this.jwtService.generateToken({
      email: user.email,
      userId: user.id,
      roles: user.roles
    });

    return {
      user: new UserClassResponseDto(user),
      token: {
        accessToken,
        refreshToken
      },
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<string> {
    const decodedToken = this.jwtService.verifyToken(refreshToken, false);

    // Проверка наличия токена в базе данных и не истек ли он
    const tokenEntity = await this.refreshTokensRepository.findOne({
      where: {
        token: refreshToken
      } });
    if (!tokenEntity || new Date() > tokenEntity.expiresIn) {
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }

    // Удаление использованного Refresh токена из базы данных
    await this.deleteToken(refreshToken);

    // Генерация нового Access токена
    return this.jwtService.generateToken(decodedToken).accessToken;;
  }
}
