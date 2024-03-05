import {IsNumber, IsString} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";
import {HttpStatus} from "@nestjs/common";

class ResponseExceptionDto {
  @IsString()
  @ApiProperty()
  message: string;

  @IsNumber()
  @ApiProperty()
  status: number;
}


export class BadResponseDto extends ResponseExceptionDto {
  status = HttpStatus.BAD_REQUEST;
}

export class UnauthorizedResponseDto extends ResponseExceptionDto {
  status = HttpStatus.UNAUTHORIZED;
}
