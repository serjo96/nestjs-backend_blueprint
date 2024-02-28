import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { Expose } from 'class-transformer';

export class ForgottenPasswordDto {
  @ApiProperty({ description: 'Token for reset password' })
  @Expose()
  @IsString()
  @IsNotEmpty()
  token: string;

}
