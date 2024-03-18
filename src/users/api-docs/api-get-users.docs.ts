import {applyDecorators} from '@nestjs/common';
import {ApiOperation, ApiOkResponse} from '@nestjs/swagger';

import {UserResponseDto} from "@user/dto/user.dto";

//Api docs for get all users.
export function ApiGetAllUsersDocs() {
  return applyDecorators(
    ApiOperation({
      operationId: 'getAllUsers',
      summary: 'Return all users of app.',
    }),
    ApiOkResponse({
      description: 'Returns all users.',
      type: [UserResponseDto]
    })
  );
}


//Api docs for get current user.
export function ApiGetCurrentUsersDocs() {
  return applyDecorators(
    ApiOperation({
      operationId: 'getCurrentUser',
      summary: 'Return current auth user.',
    }),
    ApiOkResponse({
      description: 'Return current authorized user.',
      type: UserResponseDto
    })
  );
}
