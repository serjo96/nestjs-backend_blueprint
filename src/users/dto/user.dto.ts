import {ApiHideProperty, ApiProperty, OmitType} from '@nestjs/swagger';
import {Exclude} from 'class-transformer';
import {UserEntity} from "@user/users.entity";
import {ProfileResponseDto} from "@user/dto/profile.dto";

export class UserResponseDto extends OmitType(UserEntity, ['password', 'forgottenPassword', 'emailVerification','refreshTokens', 'profile'] as const) {
  @ApiProperty({ type: () => ProfileResponseDto })
  profile: ProfileResponseDto;

  @ApiHideProperty()
  @Exclude()
  password: string
}
