import {Catch, ExceptionFilter, ArgumentsHost, HttpException, HttpStatus, Logger} from '@nestjs/common';
import {Request, Response} from "express";
import * as Sentry from "@sentry/node";
import {TypeORMError} from "typeorm";

import {isProd, isStage} from "~/utils/envType";
import {CustomServerException} from "~/common/exceptions/CustomServerException";
import {MicroserviceError} from "~/common/exceptions/MicroserviceError";
import {DatabaseError} from "~/common/exceptions/DatabaseError";

type ResponseData = {
	statusCode: HttpStatus,
	message: string,
	stackTrace?: string
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
	catch(exception: any, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();
		const logger = new Logger(GlobalExceptionFilter.name)

		const responseData: ResponseData = {
			statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
			message: 'Internal Server Error'
		}

		if (exception instanceof DatabaseError || exception instanceof TypeORMError) {
			logger.error(exception, exception.stack, exception.name)
			logger.log(exception.message, {
				payload: (exception as DatabaseError).payload
			})
      isProd && Sentry.captureException(exception)
		} else if (exception instanceof MicroserviceError) {
			logger.error(exception, exception.stack, exception.name)
			logger.log(exception.message, {
				payload: exception.payload
			})
		} else if(exception instanceof CustomServerException ) {
			responseData.statusCode = 500;
			responseData.message = exception.message;
		} else if (exception.getStatus && exception.getStatus() !== 500 || exception instanceof HttpException) {
			responseData.statusCode = exception.getStatus();
			responseData.message = exception.message;
		}

		if(isStage) {
			responseData.message = exception.message
			responseData.stackTrace = exception.trace
		}

		(isProd || isStage) && Sentry.captureException(exception)

		logger.error(exception, exception.stack, {
			payload: request.body || request.query
		})

		logger.log(exception.message, {
			payload: request.body || request.query
		})
		response.status(responseData.statusCode).json(responseData);
	}
}
