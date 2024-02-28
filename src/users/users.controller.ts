import { Body, Controller, Delete, Get, Param, Put, Req, UseGuards, UseInterceptors, UsePipes, HttpStatus } from '@nestjs/common';
import {ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiOkResponse} from '@nestjs/swagger';
import { EditUserDto } from '@user/dto/edit-user.dto';
import { UserResponseDto } from '@user/dto/user-response.dto';
import { Request } from 'express';

import {RolesEnum, UserEntity} from '@user/users.entity';


import { UsersService } from './users.service';
import {RolesGuard} from "~/common/guards/roles.guard";
import {JwtAuthGuard} from "~/common/guards/jwt-auth.guard";
import {TransformInterceptor} from "~/common/interceptors/TransformInterceptor";
import {BadRequestException} from "~/common/exceptions/bad-request";
import {Roles} from "~/common/decorators/roles";
import {ValidationPipe} from "~/common/Pipes/validation.pipe";
import {UserDto} from "@user/dto/user.dto";

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({
    operationId: 'Receive all users',
    summary: 'Receive all users of app',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns all users',
  })
  @Roles(RolesEnum.ADMIN)
  @UseInterceptors(new TransformInterceptor(UserResponseDto))
  getAllUsers(): Promise<UserEntity[]> {
    return this.usersService.findAll({});;
  }

  @Get('/current')
  @Roles(RolesEnum.USER, RolesEnum.ADMIN)
  @ApiParam({ name: 'id', required: true, description: 'ID of the user' })
  @ApiOkResponse({
    description: 'Return current authorized user.',
    type: UserDto
  })
  @UseInterceptors(new TransformInterceptor(UserResponseDto))
  async profile(@Req() req: Request): Promise<any> {
    const { user } = req;

    return user;
  }

  @Delete(':id')
  @ApiParam({ name: 'id', required: true, description: 'ID of the user' })
  @Roles(RolesEnum.ADMIN)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new TransformInterceptor(UserResponseDto))
  async removeUser(@Param() { id }: { id: string }, @Req() req: Request): Promise<UserEntity> {
    const { user } = req;
    let deletedUser;
    if (user.id === id) {
      throw new BadRequestException({
        message: "You can't delete yourself",
      });
    }
    await this.usersService.removeUser(id);
    deletedUser = await this.usersService.findOne({id}, { withDeleted: true });

    return deletedUser;
  }

  @Put(':id')
  @ApiParam({ name: 'id', required: true, description: 'ID of the user' })
  @ApiOperation({
    operationId: 'Edit user by id',
    summary: 'Receive id of user with payload and edit him.',
    description: 'Receive id of user with payload for edit, check exist user if not return exception, if ok find user by id and edit him.'
  })
  @ApiOkResponse({
    description: 'Return edited user',
    type: UserEntity,
  })
  @ApiBody({
    type: EditUserDto,
  })
  @Roles(RolesEnum.ADMIN)
  @UsePipes(new ValidationPipe())
  @UseInterceptors(new TransformInterceptor(UserResponseDto))
  async editUser(
    @Param() { id }: { id: string },
    @Body() body: EditUserDto
  ): Promise<{ data: UserEntity }> {
    let editedUser;
    const updatingUser = await this.usersService.findOne({id});
    if (!updatingUser) {
      throw new BadRequestException({
        message: `User doesn't exist`,
      });
    }
    try {
      console.log(body);
      editedUser = await this.usersService.updateUser(id, body);
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
    }

    return editedUser;
  }
}
