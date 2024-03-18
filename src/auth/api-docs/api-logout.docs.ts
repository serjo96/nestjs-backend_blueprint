import { applyDecorators } from '@nestjs/common';
import {ApiOkResponse, ApiBody, ApiBadRequestResponse, ApiOperation} from '@nestjs/swagger';
import {RefreshTokenDto} from "~/auth/dto/refresh-token.dto";
import {BadResponseDto} from "~/common/dto/response-exception.dto";

//Api docs for logout
export function ApiLogoutDocs() {
  return applyDecorators(
    ApiOperation({
      operationId: 'logout',
      summary: 'Logout user.',
      description: 'Removing user tokens from db.'
    }),
    ApiBody({ type: RefreshTokenDto }),
    ApiBadRequestResponse({
      description: 'Returns if token not exist.',
      type: BadResponseDto
    }),
    ApiOkResponse({
      description: 'Return true if all success.',
      type: Boolean
    }),
  );
}
