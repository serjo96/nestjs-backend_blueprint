import {applyDecorators} from '@nestjs/common';
import {ApiOkResponse, ApiParam, ApiBadRequestResponse, ApiOperation} from '@nestjs/swagger';

import {UserResponseDto} from "@user/dto/user.dto";

//Api docs for delete user
export function ApiDeleteUsersDocs() {
  return applyDecorators(
    ApiOperation({
      operationId: 'deleteUser',
      summary: 'Delete user.',
    }),
    ApiParam({
      name: 'id',
      required: true,
      description: 'ID of the user.'
    }),
    ApiBadRequestResponse({
      description: 'Returns if you will be try to delete yourself.'
    }),
    ApiOkResponse({
      description: 'Returns deleted user.',
      type: [UserResponseDto]
    })
  );
}
