import {BadRequestException, HttpStatus} from '@nestjs/common';

export class RateLimitException extends BadRequestException {
  constructor(message: string, public unlockTime: number) {
    super({
      statusCode: HttpStatus.TOO_MANY_REQUESTS,
      message,
      unlockTime,
    });
  }
}
