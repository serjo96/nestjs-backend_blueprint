import { BadRequestException, HttpStatus } from '@nestjs/common';
import {ValidationError} from "@nestjs/common/interfaces/external/validation-error.interface";

type ErrorObject = {
  [key: string]: any;
}

export interface ErrorData {
  messages: string[],
  nested?: ErrorData
}

const formattedErrors = (error: ValidationError[]) => {
  return error.reduce((acc, error) => {
    const messages = Object.values(error.constraints);
    acc[error.property] = {
      messages,
    };

    if(error.children && error.children.length) {
      acc[error.property].nested = formattedErrors(error.children)
    }
    return acc;
    }, {} as ErrorObject);
}
export function formatErrors(errors: ValidationError[]) {

	return new BadRequestException({
		statusCode: HttpStatus.BAD_REQUEST,
		errors: formattedErrors(errors),
		error: 'Validation Error'
	});
}
