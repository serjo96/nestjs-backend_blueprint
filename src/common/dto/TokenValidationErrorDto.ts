import {ApiProperty} from "@nestjs/swagger";

export class TokenValidationErrorDto {

  @ApiProperty()
  message: string;
  @ApiProperty()
  unlockTime: number;
}
