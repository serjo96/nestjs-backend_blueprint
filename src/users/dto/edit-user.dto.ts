import {IsEmail, IsEnum, IsOptional, IsString, IsUUID, ValidateNested} from 'class-validator';
import { Type } from 'class-transformer';
import {RolesEnum} from "@user/users.entity";

class ProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  birthday?: Date;

  @IsOptional()
  @IsString()
  photoUrl?: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  nickname?: string;

  @ValidateNested()
  @Type(() => ProfileDto)
  profile?: ProfileDto;
}

export class AdminUpdateUserDto extends UpdateUserDto {
  @IsOptional()
  @IsEnum(RolesEnum)
  roles?: RolesEnum;
}
