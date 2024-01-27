import { Exclude, Transform } from 'class-transformer';
import {IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString} from 'class-validator';

import { RolesEnum } from '@user/users.entity';

export class UserResponseDto {
  @IsNotEmpty() id: string;
  @IsNotEmpty() @IsEmail() email: string;

  @IsString() login?: string;

  @Exclude()
  @IsString()
  password: string;

  // @Transform((status) => RolesEnum[status])
  @IsEnum(RolesEnum)
  @IsOptional()
  roles: RolesEnum;
}
