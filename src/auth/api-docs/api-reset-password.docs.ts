import {applyDecorators, HttpStatus} from '@nestjs/common';
import {ApiOkResponse, ApiBody, ApiBadRequestResponse, ApiParam, ApiResponse} from '@nestjs/swagger';
import {RefreshTokenDto} from "~/auth/dto/refresh-token.dto";
import {BadResponseDto} from "~/common/dto/response-exception.dto";
import {ApiTooManyRequestsResponse} from "@nestjs/swagger/dist/decorators/api-response.decorator";
import {TokenValidationErrorDto} from "~/common/dto/TokenValidationErrorDto";

export function ApiForgotPasswordDocs() {
  return applyDecorators(
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


export function ApiResetPasswordDocs() {
  return applyDecorators(
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
