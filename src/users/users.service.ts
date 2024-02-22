import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { FindOptionsRelations } from 'typeorm/find-options/FindOptionsRelations';

import { BadRequestException } from '../common/exceptions/bad-request';

import { CreateUserDto } from './dto/create-user.dto';

import { UserEntity } from './users.entity';
import {DatabaseError} from "~/common/exceptions/DatabaseError";
import {FindOptionsWhere} from "typeorm/find-options/FindOptionsWhere";
import {FindManyOptions} from "typeorm/find-options/FindManyOptions";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  public findAll(where: FindManyOptions<UserEntity>): Promise<UserEntity[]> {
    return this.userRepository.find(where).catch(err => {
      throw new DatabaseError(err.message);
    });
  }

  public findOne(where: FindOptionsWhere<UserEntity>): Promise<UserEntity | undefined> {
    return this.userRepository.findOne({
      where,
      order: { id: 'desc' },
    }).catch(err => {
      throw new DatabaseError(err.message);
    });
  }

  public async findById(id: string, opts?: FindOneOptions<UserEntity>): Promise<UserEntity | null> {
    return await this.userRepository.findOneOrFail({ where: { id }, ...opts }).catch(err => {
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

  async create(userDto: Partial<CreateUserDto>): Promise<UserEntity | undefined> {
    const { password, email } = userDto;

    const userInDb = await this.userRepository.findOne({
      where: { email },
    }).catch(err => {
      throw new DatabaseError(err.message);
    });

    if (userInDb) {
      throw new BadRequestException('User already exists');
    }

    const user: UserEntity = await this.userRepository.create({
      password,
      email,
    });
    await this.userRepository.save(user).catch(err => {
      throw new DatabaseError(err.message);
    });
    return user;
  }

  async updateUser(id: string, data: any) {
    const toUpdate = await this.userRepository.findOneBy({ id });
    const updated: any = Object.assign(toUpdate, data);
    try {
      return await this.userRepository.save(updated);
    } catch (error) {
      console.log(error);
    }
  }

  public updateUserFiled(id: string, payload: Partial<UserEntity>) {
    return this.userRepository.update(id, payload)
  }

  async removeUser(id: string) {
    return await this.userRepository.softDelete({ id });
  }
}
