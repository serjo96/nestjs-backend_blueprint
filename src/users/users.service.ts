import {Injectable, NotFoundException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { FindOptionsRelations } from 'typeorm/find-options/FindOptionsRelations';

import { BadRequestException } from '../common/exceptions/bad-request';

import { CreateUserDto } from './dto/create-user.dto';

import { UserEntity } from './users.entity';
import {DatabaseError} from "~/common/exceptions/DatabaseError";
import {FindOptionsWhere} from "typeorm/find-options/FindOptionsWhere";
import {FindManyOptions} from "typeorm/find-options/FindManyOptions";
import {Profile} from "@user/profiles.entity";
import {AdminUpdateUserBodyDto} from "@user/dto/edit-user.dto";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(Profile)
    private readonly userProfileRepository: Repository<Profile>,
  ) {}

  public findAll(where: FindManyOptions<UserEntity>): Promise<UserEntity[]> {
    return this.userRepository.find(where).catch(err => {
      throw new DatabaseError(err.message);
    });
  }

  public findOne(where: FindOptionsWhere<UserEntity>, opts?: FindOneOptions<UserEntity>): Promise<UserEntity | undefined> {
    return this.userRepository.findOne({
      where,
      order: { id: 'desc' },
      ...opts,
    }).catch(err => {
      throw new DatabaseError(err.message);
    });
  }

  public async findByEmail(userEmail: string, relations?: FindOptionsRelations<UserEntity>): Promise<UserEntity | null> {
    return await this.userRepository.findOne({
      where: { email: userEmail },
      relations,
    }).catch(err => {
      throw new DatabaseError(err.message);
    });
  }

  public async create(userDto: Partial<CreateUserDto>): Promise<UserEntity> {
    const user: UserEntity = await this.userRepository.create({
      ...userDto,
      lastActiveAt: new Date(),
      profile: {}
    });

    return await this.userRepository.save(user).catch(err => {
      throw new DatabaseError(err.message);
    });
  }


  //TODO: Fix argument types
  public async updateUser(id: string, data: AdminUpdateUserBodyDto | Partial<UserEntity>) {
    const toUpdate = await this.userRepository.findOneBy({ id });
    const updated: UserEntity = Object.assign(toUpdate, data);

    return await this.userRepository.save(updated).catch(err => {
      throw new DatabaseError(err.message);
    });
  }

  public getUserProfile(userId: string) {
    return this.userProfileRepository.findOne({
      where: {
        user: {id: userId}
      }
    }).catch(err => {
      throw new DatabaseError(err.message);
    })
  }

  public updateUserFiled(id: string, payload: Partial<UserEntity>) {
    return this.userRepository.update(id, payload).catch(err => {
      throw new DatabaseError(err.message);
    })
  }

  private async removeUser(id: string) {
    return await this.userRepository.softDelete({ id }).catch(err => {
      throw new DatabaseError(err.message);
    });
  }

  public async setUserLastActivity(userId: string) {
    return await this.userRepository.update(userId, {lastActiveAt: new Date()}).catch(err => {
      throw new DatabaseError(err.message);
    })
  }

  public async deleteUser(userId: string, currentUserId: string) {
    if (currentUserId === userId) {
      throw new BadRequestException( "You can't delete yourself");
    }
    await this.removeUser(userId);
    return await this.findOne({id: userId}, { withDeleted: true });
  }

  public async findVerifiedUserByEmail(email: string): Promise<UserEntity> {
    const user = await this.findByEmail(email, { emailVerification: true });
    if (!user) {
      throw new BadRequestException(`User doesn't exist`);
    }

    return user;
  }
}
