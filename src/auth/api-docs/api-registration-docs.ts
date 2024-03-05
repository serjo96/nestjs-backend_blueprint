import { applyDecorators } from '@nestjs/common';
import {ApiResponse, ApiOkResponse, ApiParam, ApiBadRequestResponse} from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';
import {UserWithToken} from "~/auth/dto/tokens.dto";
import {RegistrationValidationErrorDto} from "~/common/dto/error-validation.dto";

export function ApiRegistrationDocs() {
  return applyDecorators(
    ApiOkResponse({
      description: 'A user has been successfully registration',
      type: UserWithToken,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Returns bad request if password is too weak or email not valid, or if user already exists.',
      type: RegistrationValidationErrorDto,
    })
  );
}

export function ApiConfirmRegistrationDocs() {
  return applyDecorators(
    ApiParam({
      name: 'token',
      description: 'Token for confirm registration',
      type: String,
    }),
    ApiBadRequestResponse({
      description: 'Returns if email token not found or token was expired.'
    }),
    ApiResponse({
      status: HttpStatus.PERMANENT_REDIRECT,
      description: 'Redirects to frontend app or at error page if was exception.',
    })
  );
}
