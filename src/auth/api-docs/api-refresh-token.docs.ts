import { applyDecorators } from '@nestjs/common';
import {ApiBody, ApiOkResponse, ApiForbiddenResponse, ApiOperation} from '@nestjs/swagger';
import {TokensResponse} from "~/auth/dto/tokens.dto";
import {RefreshTokenDto} from "~/auth/dto/refresh-token.dto";
import {UnauthorizedResponseDto} from "~/common/dto/response-exception.dto";

//Api docs for refresh token.
export function ApiRefreshTokenDocs() {
  return applyDecorators(
    ApiOperation({
      operationId: 'updateAccessToken',
      summary: 'Updating access token by refresh token.',
    }),
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
