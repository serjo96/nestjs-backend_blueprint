import {UserEntity} from "@user/users.entity";
import {IsString} from "class-validator";
import {UserDto} from "@user/dto/user.dto";

export class TokensResponse {
  @IsString()
  accessToken: string;

  @IsString()
  refreshToken: string;
}

export class UserWithToken {
  user: UserDto;
  token: TokensResponse;
}
