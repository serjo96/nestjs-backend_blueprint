import {IsEmail, IsEnum, IsNumber, IsString, IsUUID} from "class-validator";
import {UserResponseDto} from "@user/dto/user.dto";
import {ApiProperty} from "@nestjs/swagger";
import {RolesEnum} from "@user/users.entity";

export class TokensResponse {
  @IsString()
  accessToken: string;

  @IsString()
  refreshToken: string;
}

export class TokenUser {

  @IsEmail()
  @ApiProperty()
  email: string;

  @IsEnum(RolesEnum)
  @ApiProperty()
  roles: RolesEnum;

  @IsUUID()
  @ApiProperty()
  userId: string

  @IsNumber()
  @ApiProperty()
  iat: number;

  @IsNumber()
  @ApiProperty()
  exp: number;
}

export class UserWithToken {
  user: UserResponseDto;
  token: TokensResponse;
}
