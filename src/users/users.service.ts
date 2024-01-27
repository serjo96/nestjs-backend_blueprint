import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { FindOptionsRelations } from 'typeorm/find-options/FindOptionsRelations';

import { BadRequestException } from '../common/exceptions/bad-request';

import { CreateUserDto } from './dto/create-user.dto';

import { UserEntity } from './users.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  findAll(where: any): Promise<UserEntity[]> {
    return this.userRepository.find(where);
  }

  findOne(where: any): Promise<UserEntity | undefined> {
    return this.userRepository.findOne({
      where,
      order: { id: 'desc' },
    });
  }

  public async findById(id: string, opts?: FindOneOptions<UserEntity>): Promise<UserEntity | null> {
    return await this.userRepository.findOneOrFail({ where: { id }, ...opts });
  }

  public async findByEmail(userEmail: string, relations?: FindOptionsRelations<UserEntity>): Promise<UserEntity | null> {
    return await this.userRepository.findOne({
      where: { email: userEmail },
      relations,
    });
  }

  async create(userDto: Partial<CreateUserDto>): Promise<UserEntity | undefined> {
    const { password, email } = userDto;

    const userInDb = await this.userRepository.findOne({
      where: { email },
    });

    if (userInDb) {
      throw new BadRequestException('User already exists');
    }

    const user: UserEntity = await this.userRepository.create({
      password,
      email,
    });
    await this.userRepository.save(user);
    return user;
  }

  async editUser(id: string, data: any) {
    const toUpdate = await this.userRepository.findOneBy({ id });
    const updated: any = Object.assign(toUpdate, data);
    try {
      return await this.userRepository.save(updated);
    } catch (error) {
      console.log(error);
    }
  }

  async removeUser(id: string) {
    return await this.userRepository.softDelete({ id });
  }
}
