import {applyDecorators} from '@nestjs/common';
import {ApiResponse, ApiOkResponse, ApiBody, ApiUnauthorizedResponse} from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';

import {UserWithToken} from "~/auth/dto/tokens.dto";
import {LoginByEmail} from "~/auth/dto/login.dto";
import {UnauthorizedResponseDto} from "~/common/dto/response-exception.dto";

export function ApiLoginDocs() {
  return applyDecorators(
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: `Returns if user not exist or wrong password.`,
      type: UnauthorizedResponseDto
    }),
    ApiOkResponse({
      description: 'Return user with tokens at success login.',
      type: UserWithToken
    }),
    ApiBody({
      type: LoginByEmail
    })
  );
}

export function ApiLoginTokenDocs() {
  return applyDecorators(
    ApiUnauthorizedResponse({
      description: "If user doesn't exist or invalid token.",
      type: UnauthorizedResponseDto
    }),
    ApiOkResponse({
      description: 'Return user with tokens at success login.',
      type: UserWithToken
    })
  )
}
