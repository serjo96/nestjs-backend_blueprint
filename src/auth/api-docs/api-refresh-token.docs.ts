import { applyDecorators } from '@nestjs/common';
import {ApiBody, ApiOkResponse, ApiForbiddenResponse} from '@nestjs/swagger';
import {TokensResponse} from "~/auth/dto/tokens.dto";
import {RefreshTokenDto} from "~/auth/dto/refresh-token.dto";
import {UnauthorizedResponseDto} from "~/common/dto/response-exception.dto";

export function ApiRefreshTokenDocs() {
  return applyDecorators(
    ApiBody({ type: RefreshTokenDto }),
    ApiOkResponse({
      description: 'The access token has been refreshed successfully',
      type: TokensResponse
    }),
    ApiForbiddenResponse({
      description: "Returns if token is invalid or expired.",
      type: UnauthorizedResponseDto
    }),
  );
}
