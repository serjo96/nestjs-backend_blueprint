import {UserEntity} from "@user/users.entity";
import {IsString} from "class-validator";

export class TokensResponse {
  @IsString()
  accessToken: string;

  @IsString()
  refreshToken: string;
}

export class UserWithToken {
  user: UserEntity;
  token: TokensResponse;
}
