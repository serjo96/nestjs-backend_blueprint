import {forwardRef, Module} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersController } from './users.controller';
import { UserEntity } from './users.entity';
import { UsersService } from './users.service';
import {AuthModule} from "~/auth/auth.module";
import {Profile} from "@user/profiles.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, Profile]),
    // Added for JwtAuthGuard
    forwardRef(() => AuthModule),
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
