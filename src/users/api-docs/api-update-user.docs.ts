import {applyDecorators} from '@nestjs/common';
import {ApiOperation, ApiOkResponse, ApiParam, ApiBody, ApiNotFoundResponse} from '@nestjs/swagger';

import {UserResponseDto} from "@user/dto/user.dto";
import {AdminUpdateUserBodyDto, UpdateUserBodyDto} from "@user/dto/edit-user.dto";

//Api docs for update user
export function ApiUpdateUserDocs() {
  return applyDecorators(
    ApiOperation({
      operationId: 'editUser',
      summary: 'Update user data.',
      description: 'Receive id of user with payload for edit, checks existing user, if not return exception, if ok find user by id and edit him.',
      tags: ['user', 'update']
    }),
    ApiParam({
      name: 'id',
      required: true,
      description: 'ID of the user'
    }),
    ApiOkResponse({
      description: 'Return edited user',
      type: UserResponseDto,
    }),
    ApiBody({
      type: UpdateUserBodyDto,
    })
  );
}



//Api docs for update user by admin
export function ApiAdminUpdateUserDocs() {
  return applyDecorators(
    ApiOperation({
      operationId: 'adminEditUser',
      summary: 'Update user data.',
      description: 'Update user only for admin, you may to update any param like password and etc.',
      tags: ['user', 'update', 'admin']
    }),
    ApiParam({
      name: 'id',
      required: true,
      description: 'ID of the user.'
    }),
    ApiNotFoundResponse({
      description: 'Returns if user not found.'
    }),
    ApiOkResponse({
      description: 'Return edited user.',
      type: UserResponseDto,
    }),
    ApiBody({
      type: AdminUpdateUserBodyDto,
    })
  );
}
