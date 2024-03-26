import {IsEmail, IsEnum, IsOptional, IsString, ValidateNested} from 'class-validator';
import {RolesEnum, UserEntity} from "@user/users.entity";
import {OmitType, PartialType} from "@nestjs/swagger";
import {ProfileDto} from "@user/dto/profile.dto";
import {Type} from "class-transformer";

class UserBodyParams extends OmitType(UserEntity, ['password', 'roles', 'forgottenPassword', 'emailVerification','refreshTokens', 'lastActiveAt', 'confirmed', 'profile', 'id'] as const) {}
export class UpdateUserBodyDto extends PartialType(UserBodyParams) {
  @IsEmail()
  @IsOptional()
  public email?: string;

  @IsString()
  @IsOptional()
  public nickname?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ProfileDto)
  public profile?: ProfileDto;

}
export class AdminUpdateUserBodyDto extends UpdateUserBodyDto {
  @IsOptional()
  @IsEnum(RolesEnum)
  roles?: RolesEnum;
}
