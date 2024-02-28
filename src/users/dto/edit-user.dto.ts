import { Exclude, Transform } from 'class-transformer';
import {IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString} from 'class-validator';

import { RolesEnum } from '@user/users.entity';
import enumTansform from "~/utils/enumTransform";

export class EditUserDto {
  @IsEmail() email?: string;
  @IsString() name?: string;

  @IsString()
  password?: string;

  // @Transform((status) => enumTansform(status, RolesEnum))
  @IsEnum(RolesEnum)
  @IsOptional()
  roles?: RolesEnum;
}
