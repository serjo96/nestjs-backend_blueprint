import { applyDecorators } from '@nestjs/common';
import {ApiOkResponse, ApiBody, ApiBadRequestResponse} from '@nestjs/swagger';
import {RefreshTokenDto} from "~/auth/dto/refresh-token.dto";
import {BadResponseDto} from "~/common/dto/response-exception.dto";

export function ApiLogoutDocs() {
  return applyDecorators(
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
