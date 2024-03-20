import {Catch, ExceptionFilter, ArgumentsHost, HttpException, HttpStatus, Logger} from '@nestjs/common';
import {Request, Response} from "express";
import {TypeORMError} from "typeorm";

import {CustomServerException} from "~/common/exceptions/CustomServerException";
import {DatabaseError} from "~/common/exceptions/DatabaseError";
import {RateLimitException} from "~/common/exceptions/RateLimitException";
import {RedirectException} from "~/common/exceptions/RedirectException";
import {ErrorData} from "~/common/custom-validations";

type ResponseData = {
	status: HttpStatus,
	message: string,
	stackTrace?: string
  errors?: {
    [key: string]: ErrorData;
  }
  payload?: {
    [key: string]: string | number;
  }
}

type ErrorPayload = {
  requestPayload: unknown
  exceptionPayload: unknown
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
	catch(exception: any, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();
		const logger = new Logger(GlobalExceptionFilter.name)
    const responseData: ResponseData = {
      status:  HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal Server Error'
    }
     const errorPayload: ErrorPayload = {
        requestPayload: request.body || request.query,
        exceptionPayload: null
    };

    if (exception instanceof DatabaseError || exception instanceof TypeORMError) {
      errorPayload.exceptionPayload = (exception as DatabaseError).payload
    } else if(exception instanceof CustomServerException ) {
      responseData.status = 500;
      responseData.message = exception.message;
    } else if (exception instanceof RateLimitException) {
      responseData.status = exception.getStatus();
      responseData.message = exception.message;
      responseData.payload = { unlockTime: exception.unlockTime };
    } else if (exception instanceof RedirectException) {
      responseData.status = exception.getStatus();
      responseData.message = exception.message;
      logger.error(exception, exception.stack, errorPayload)

      return response.redirect(exception.redirectUrl)
    } else if (exception.getStatus && exception.getStatus() !== 500 || exception instanceof HttpException) {
      const exceptionResp = exception.getResponse()
      responseData.status = exception.getStatus();
      responseData.message = exception.message;

      if(exceptionResp.errors) {
        responseData.errors = exceptionResp.errors
      }
    }

    logger.error(exception, exception.stack, errorPayload)

    response.status(responseData.status).json(responseData);
	}
}
