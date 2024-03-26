import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Req,
  UseGuards,
  UseInterceptors,
  Patch,
  NotFoundException
} from '@nestjs/common';
import {ApiBearerAuth, ApiTags, ApiUnauthorizedResponse} from '@nestjs/swagger';
import {AdminUpdateUserBodyDto, UpdateUserBodyDto} from '@user/dto/edit-user.dto';
import { Request } from 'express';

import {RolesEnum, UserEntity} from '@user/users.entity';

import { UsersService } from './users.service';
import {RolesGuard} from "~/common/guards/roles.guard";
import {JwtAuthGuard} from "~/common/guards/jwt-auth.guard";
import {TransformInterceptor} from "~/common/interceptors/TransformInterceptor";
import {Roles} from "~/common/decorators/roles";
import {UserResponseDto} from "@user/dto/user.dto";
import {UnauthorizedResponseDto} from "~/common/dto/response-exception.dto";
import {ApiGetAllUsersDocs, ApiGetCurrentUsersDocs} from "@user/api-docs/api-get-users.docs";
import {ApiDeleteUsersDocs} from "@user/api-docs/api-delete-users.docs";
import {ApiAdminUpdateUserDocs, ApiUpdateUserDocs} from "@user/api-docs/api-update-user.docs";
import {ApiGetProfileDocs} from "@user/api-docs/api-get-profile.docs";
import {ProfileDto, ProfileResponseDto} from "@user/dto/profile.dto";

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiUnauthorizedResponse({
  description: `Returns if user not authorized.`,
  type: UnauthorizedResponseDto
})
@Controller('/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiGetAllUsersDocs()
  @Roles(RolesEnum.ADMIN)
  @UseInterceptors(new TransformInterceptor(UserResponseDto))
  public async getAllUsers(): Promise<UserEntity[]> {
    return this.usersService.findAll({});
  }

  @Get('/current')
  @ApiGetCurrentUsersDocs()
  @UseInterceptors(new TransformInterceptor(UserResponseDto))
  public async getCurrentUser(@Req() req: Request): Promise<UserEntity> {
    const { user } = req;
    return this.usersService.findOne({id: user.userId});
  }

  @Delete(':id')
  @ApiDeleteUsersDocs()
  @Roles(RolesEnum.ADMIN)
  @UseInterceptors(new TransformInterceptor(UserResponseDto))
  public async removeUser(@Param() { id }: { id: string }, @Req() req: Request): Promise<UserEntity> {
    const { user } = req;
    return this.usersService.deleteUser(id, user.userId);
  }


  @Patch('/:id')
  @ApiUpdateUserDocs()
  @UseInterceptors(new TransformInterceptor(UserResponseDto))
  public async editUser(
    @Param() { id }: { id: string },
    @Body() body: UpdateUserBodyDto
  ): Promise<UserEntity> {
    const updatingUser = await this.usersService.findOne({id});
    if (!updatingUser) {
      throw new NotFoundException(`User with id: ${id}, doesn't exist.`);
    }

    return this.usersService.updateUser(id, body);
  }

  @Patch('/admin/:id')
  @ApiAdminUpdateUserDocs()
  @Roles(RolesEnum.ADMIN)
  @UseInterceptors(new TransformInterceptor(UserResponseDto))
  public async adminEditUser(
    @Param() { id }: { id: string },
    @Body() body: AdminUpdateUserBodyDto
  ): Promise<UserEntity> {
    const updatingUser = await this.usersService.findOne({id});
    if (!updatingUser) {
      throw new NotFoundException(`User with id: ${id}, doesn't exist.`);
    }

    // Here may be any method for any update user by admin
    return this.usersService.updateUser(id, body);
  }


  @Get('/profile/:id')
  @ApiGetProfileDocs()
  @UseInterceptors(new TransformInterceptor(ProfileResponseDto))
  public async getUserProfile(@Param() { id }: { id: string }): Promise<ProfileResponseDto> {
    return this.usersService.getUserProfile(id);
  }
}
