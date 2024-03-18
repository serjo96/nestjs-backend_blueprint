import {applyDecorators} from '@nestjs/common';
import {ApiResponse, ApiOkResponse, ApiBody, ApiUnauthorizedResponse, ApiOperation} from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';

import {UserWithToken} from "~/auth/dto/tokens.dto";
import {LoginByEmail} from "~/auth/dto/login.dto";
import {UnauthorizedResponseDto} from "~/common/dto/response-exception.dto";


//Api docs for login
export function ApiLoginDocs() {
  return applyDecorators(
    ApiOperation({
      operationId: 'login',
      summary: 'Login user.',
    }),
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


//Api docs for login by token.
export function ApiLoginTokenDocs() {
  return applyDecorators(
    ApiOperation({
      operationId: 'tokenLogin',
      summary: 'Login user by token.',
    }),
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
