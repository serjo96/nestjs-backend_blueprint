import { BadRequestException as Exception, Logger } from '@nestjs/common';

export class BadRequestException extends Exception {
  constructor(message?: any, error?: string) {
    let msg: Record<string, unknown> | string | undefined;
    const logger = new Logger('Bad request');

    if (message && message instanceof Object) {
      msg = {
        statusCode: 400,
        error: 'Bad Request',
        message: [message],
      };
    } else if (message && typeof message === 'string') {
      msg = message;
    }

    super(msg, error);
    logger.error(new Date().toString() + ' - [Response]: ' + message + (error ? ' - ' + JSON.stringify(error) : ''));
  }
}
