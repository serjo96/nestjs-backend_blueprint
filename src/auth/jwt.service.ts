import {Injectable, UnauthorizedException} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserResponseDto } from '@user/dto/user-response.dto';

import { IJwtPayload } from './passport/jwt.interface';
import {ConfigService} from "@nestjs/config";
import {AuthConfig} from "~/config/auth.config";
import dayjs, {ManipulateType} from "dayjs";
import {ConfigEnum} from "~/config/main-config";

@Injectable()
export class JWTService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService
  ) {}

  private get autConfig() {
    const {
      jwt_secret_key: accessSecret,
      jwt_expire_time: accessExpiresIn,
      jwt_expire_time_value: expireValue,
      jwt_expire_time_type: expireUnit,
      jwt_refresh_secret_key: refreshSecret,
      jwt_refresh_expire_time: refreshExpiresIn,
      jwt_refresh_expire_time_value: expireRefreshValue,
      jwt_refresh_expire_time_type: expireRefreshUnit,
    } = this.configService.get<AuthConfig>(ConfigEnum.AUTH)
    return {
      accessSecret,
      accessExpiresIn,
      expireValue,
      expireUnit,
      refreshSecret,
      refreshExpiresIn,
      expireRefreshValue,
      expireRefreshUnit
    }
  }

  generateToken({ email, roles, id }: UserResponseDto) {
    const {expireUnit, expireRefreshUnit, accessSecret, accessExpiresIn, expireValue, expireRefreshValue, refreshSecret} = this.autConfig
    const user: IJwtPayload = { email, roles, id };

    const accessToken: string = this.jwtService.sign(
      { user },
      {
        secret: accessSecret,
        expiresIn: accessExpiresIn,
      },
    )

    const refreshToken: string = this.jwtService.sign(
      { user },
      {
        secret: refreshSecret,
        expiresIn: this.autConfig.accessExpiresIn,
      },
    )

    const expireDateAccessToken: string = dayjs()
      .add(+expireValue, expireUnit as ManipulateType)
      .format()
    const expireDateRefreshToken: string = dayjs()
      .add(+expireRefreshValue, expireRefreshUnit as ManipulateType)
      .format()

    return {
      accessToken,
      refreshToken,
      expireDateAccessToken,
      expireDateRefreshToken
    };
  }

  verifyToken(token: string) {
    return this.jwtService.verify(token, {
      secret: this.autConfig.accessSecret,
    });
  }

  async refreshToken(refreshToken: string) {
    const decodeToken = this.jwtService.verify(refreshToken, {
      secret: this.autConfig.refreshSecret,
    })

    if (decodeToken.user) {
      return this.generateToken(decodeToken.user)
    }

    throw new UnauthorizedException()
  }

  createToken() {
    return this.jwtService.sign({});
  }
}
