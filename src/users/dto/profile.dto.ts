import { ApiProperty } from '@nestjs/swagger';
import {IsString, IsOptional, IsUrl, IsDate} from 'class-validator';

export class ProfileDto {
  @ApiProperty({
    type: String,
    description: 'User name',
    required: false
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    type: Date,
    description: 'User birthday',
    required: false
  })
  @IsDate()
  @IsOptional()
  birthday: Date;

  @ApiProperty({
    type: String,
    description: 'Profile url link',
    required: false
  })
  @IsUrl()
  photoUrl: string;
}
