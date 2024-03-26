import {applyDecorators} from '@nestjs/common';
import {ApiOperation, ApiOkResponse, ApiParam} from '@nestjs/swagger';

import {ProfileResponseDto} from "@user/dto/profile.dto";

//Api docs for get user profile.
export function ApiGetProfileDocs() {
  return applyDecorators(
    ApiOperation({
      operationId: 'getUserProfile',
      summary: 'Get user profile.',
    }),
    ApiParam({
      name: 'id',
      required: true,
      description: 'ID of the user'
    }),
    ApiOkResponse({
      description: 'Returns user profile.',
      type: [ProfileResponseDto]
    })
  );
}
