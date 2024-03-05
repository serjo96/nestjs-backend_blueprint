import {HttpStatus} from '@nestjs/common';
import {HttpException} from "@nestjs/common/exceptions/http.exception";

export class RateLimitException extends HttpException {
  constructor(message: string, public unlockTime: number) {
    super({
      message,
      unlockTime,
    }, HttpStatus.TOO_MANY_REQUESTS);
  }
}
