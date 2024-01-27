import { BadRequestException, HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserDto } from '@user/dto/user.dto';
import * as bcrypt from 'bcryptjs';

import { CreateUserDto } from '@user/dto/create-user.dto';
import { UsersService } from '@user/users.service';
import { EmailService } from '~/email/email.service';
import { MailService } from "~/email/mail.service";
import { UserClassResponseDto } from './dto/user.dto';

import { JwtPayload } from './passport/jwt.interface';
import { JWTService } from './jwt.service';
import { UserWithToken } from './interfaces/user-with-token.interface';
import { LoginByEmail } from './dto/login.dto';

export interface ValidateUserByPasswordPayload {
  email: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JWTService,
    private readonly mailService: MailService,
    private readonly emailService: EmailService
  ) {}

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

  async validateUser({ email }: JwtPayload): Promise<UserDto> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return user;
  }

  async comparePassword(attempt: string, dbPassword: string): Promise<boolean> {
    return await bcrypt.compare(attempt, dbPassword);
  }

  async register(userDto: CreateUserDto): Promise<UserWithToken> {
    const user = await this.userService.create(userDto);
    const token = this.jwtService.generateToken(user);

    await this.mailService.createEmailToken(userDto.email);
    // await this.emailService.sendEmailVerification(userDto.email);

    return {
      user: new UserClassResponseDto(user),
      token,
    };
  }

  async login(loginUserDto: LoginByEmail): Promise<UserWithToken> {
    const user = await this.validateUserByPassword(loginUserDto);

    const {accessToken, refreshToken} = this.jwtService.generateToken(user);

    return {
      user: new UserClassResponseDto(user),
      token: {
        accessToken,
        refreshToken
      },
    };
  }
}
