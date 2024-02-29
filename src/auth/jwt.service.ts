import {Injectable, UnauthorizedException} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import {ConfigService} from "@nestjs/config";
import {AuthConfig, UnionExpireType} from "~/config/auth.config";
import dayjs, {ManipulateType} from "dayjs";
import {ConfigEnum} from "~/config/main-config";
import {RolesEnum} from "@user/users.entity";

export interface JwtPayload {
  email: string;
  roles: RolesEnum;
  userId: string;
}
@Injectable()
export class JWTService {
  private readonly accessSecret: string;
  private readonly accessExpiresIn: string;
  private readonly expireValue: number;
  private readonly expireUnit: UnionExpireType;

  private readonly refreshSecret: string;
  private readonly refreshExpiresIn: string;
  private readonly expireRefreshValue: number;
  private readonly expireRefreshUnit: UnionExpireType;
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService
  ) {
    const authConfig = this.configService.get<AuthConfig>(ConfigEnum.AUTH);
    this.accessSecret = authConfig.jwt_secret_key;
    this.accessExpiresIn = `${authConfig.jwt_expire_time_value}${authConfig.jwt_expire_time_type}`;
    this.expireValue = +authConfig.jwt_expire_time_value;
    this.expireUnit = authConfig.jwt_expire_time_type;

    this.refreshSecret = authConfig.jwt_refresh_secret_key;
    this.refreshExpiresIn = `${authConfig.jwt_refresh_expire_time_value}${authConfig.jwt_refresh_expire_time_type}`;
    this.expireRefreshValue = +authConfig.jwt_refresh_expire_time_value;
    this.expireRefreshUnit = authConfig.jwt_refresh_expire_time_type;
  }

  //Generate temporary token with lifetime - 5min
  public generateTemporaryAuthToken(userId: string) {
    return this.jwtService.sign({ userId }, { expiresIn: '5m' });
  }

  public generateToken({ email, roles, userId }: JwtPayload) {
    const payload = { email, roles, userId };

    const accessToken: string = this.jwtService.sign(
      payload,
      {
        secret: this.accessSecret,
        expiresIn: this.accessExpiresIn,
      },
    )

    const refreshToken: string = this.jwtService.sign(
      payload,
      {
        secret: this.accessSecret,
        expiresIn: this.accessExpiresIn,
      },
    )


    return {
      accessToken,
      refreshToken,
      expireDateAccessToken: dayjs().add(this.expireValue, this.expireUnit as ManipulateType).toDate(),
      expireDateRefreshToken: dayjs().add(this.expireRefreshValue, this.expireRefreshUnit  as ManipulateType).toDate(),
    };
  }

  //Verify user token with passing token and flag: is accessToken or refreshToken.
  public verifyToken(token: string, isAccessToken: boolean = true): JwtPayload {
    const secret = isAccessToken ? this.accessSecret : this.refreshSecret;
    try {
      return this.jwtService.verify(token, { secret });
    } catch (error) {
      throw new UnauthorizedException('Token is invalid or expired');
    }
  }
  public refreshToken(refreshToken: string) {
    const decodedToken = this.verifyToken(refreshToken, false); // false indicates it's a refresh token

    if (decodedToken.email && decodedToken.roles && decodedToken.userId) {
      return this.generateToken(decodedToken);
    } else {
      throw new UnauthorizedException('Invalid token payload');
    }
  }
}
