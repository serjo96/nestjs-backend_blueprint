import { IsBoolean, IsEmail, IsEnum, IsNotEmpty } from 'class-validator';

import { RolesEnum } from '@user/users.entity';

export class UserDto {
  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsBoolean()
  confirmed: boolean;

  @IsEnum(RolesEnum)
  @IsBoolean()
  roles: RolesEnum;
}
