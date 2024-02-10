import { BadRequestException, HttpStatus } from '@nestjs/common';

type ErrorObject = {
  [key: string]: any;
}
export function formatErrors(errors: ErrorObject[]) {
  const formattedErrors = errors.reduce((acc, error) => {
    const messages = Object.values(error.constraints);
    acc[error.property] = messages;
    return acc;
  }, {});

	return new BadRequestException({
		statusCode: HttpStatus.BAD_REQUEST,
		errors: formattedErrors,
		error: 'Validation Error'
	});
}
