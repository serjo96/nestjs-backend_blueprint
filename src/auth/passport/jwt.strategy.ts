import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { UserDto } from '@user/dto/user.dto';
import { ExtractJwt, Strategy } from 'passport-jwt';
import {ConfigService} from "@nestjs/config";

import { AuthService } from '~/auth/auth.service';
import { JwtPayload } from '~/auth/passport/jwt.interface';
import {ConfigEnum} from "~/config/main-config";
import {AuthConfig} from "~/config/auth.config";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService, private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<AuthConfig>(ConfigEnum.AUTH).jwt_secret_key,
    });
  }

  async validate(payload: JwtPayload): Promise<UserDto> {
    const user = await this.authService.validateUser(payload);
    if (!user) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return user;
  }
}
