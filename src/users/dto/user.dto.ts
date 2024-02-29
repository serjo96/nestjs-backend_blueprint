import { ApiProperty } from '@nestjs/swagger';
import {IsEmail, IsNotEmpty, IsEnum, IsString, MinLength, ValidateNested, IsOptional} from 'class-validator';
import {Exclude, Expose, Type} from 'class-transformer';
import {RolesEnum} from "@user/users.entity";
import {ProfileDto} from "@user/dto/profile.dto";
import {ForgottenPasswordDto} from "~/auth/dto/forgottent-password.dto";

@Exclude()
export class UserDto {

  @ApiProperty()
  @Expose()
  id: string;


  @ApiProperty()
  @Expose()
  @IsEmail()
  email: string;

  @ApiProperty()
  @Expose()
  @IsNotEmpty()
  login?: string;

  @ApiProperty({ enum: RolesEnum, description: 'User role' })
  @Expose()
  @IsEnum(RolesEnum, )
  roles: RolesEnum;

  @ApiProperty()
  @Expose()
  confirmed: boolean;

  @ApiProperty()
  @IsString()
  @MinLength(4, { message: 'Password must be longer than 4 characters' })
  @IsNotEmpty()
  password?: string;


  @ApiProperty({
    type: () => ProfileDto,
    description: 'User profile',
    required: false
  })
  @Expose()
  @ValidateNested()
  @Type(() => ProfileDto)
  @IsOptional()
  profile?: ProfileDto;

}
