import { applyDecorators } from '@nestjs/common';
import {ApiBody, ApiUnauthorizedResponse, ApiOkResponse} from '@nestjs/swagger';
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
    ApiUnauthorizedResponse({
      description: "Returns if token is invalid.",
      type: UnauthorizedResponseDto
    }),
  );
}
