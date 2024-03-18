import {applyDecorators, HttpStatus} from '@nestjs/common';
import {ApiOkResponse, ApiBadRequestResponse, ApiParam, ApiResponse, ApiOperation} from '@nestjs/swagger';
import {BadResponseDto} from "~/common/dto/response-exception.dto";
import {ApiTooManyRequestsResponse} from "@nestjs/swagger/dist/decorators/api-response.decorator";
import {TokenValidationErrorDto} from "~/common/dto/TokenValidationErrorDto";

//Api docs for forgot password.
export function ApiForgotPasswordDocs() {
  return applyDecorators(
    ApiOperation({
      operationId: 'forgotPassword',
      summary: 'Send email with instructions for reset password.',
    }),
    ApiParam({ name: 'email', required: true, description: 'User email for reset password' }),
    ApiOkResponse({
      description: 'Returns ok if operation is success.',
      schema: {
        type: 'string',
        example: 'ok'
      },
    }),
    ApiBadRequestResponse({
      description: `Returns if user doesn't find or if token not valid.`,
      type: BadResponseDto
    }),
    ApiTooManyRequestsResponse({
      description: 'Returns unix time before unlock attempt, if email sent recently',
      type: TokenValidationErrorDto
    }),
  );
}


//Api docs for reset password.
export function ApiResetPasswordDocs() {
  return applyDecorators(
    ApiOperation({
      operationId: 'resetPassword',
      summary: 'Reset password.',
      description: 'Creating new password, and redirect to app page with temporary token for auth by token.'
    }),
    ApiParam({
      name: 'token',
      required: true,
      description: 'Token for reset password.'
    }),
    ApiResponse({
      status: HttpStatus.PERMANENT_REDIRECT,
      description: 'Redirect user to login page or at error page if was exception.'
    })
  );
}
