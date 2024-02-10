import * as bcrypt from 'bcryptjs';
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToOne } from 'typeorm';

import { BaseEntity } from '~/common/base-entity';
import { Profile } from './profiles.entity';
import {ForgottenPasswordEntity} from "~/auth/entity/forgotten-password.entity";

export enum RolesEnum {
  GUEST = 'guest',
  USER = 'user',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
}

@Entity('users')
export class UserEntity extends BaseEntity {
  @Column({
    type: 'varchar',
    nullable: false,
    select: true,
  })
  password: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  email: string;

  @Column({
    nullable: true,
  })
  public login?: string;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  @Column({
    default: RolesEnum.USER,
    type: 'string'
  })
  public roles: RolesEnum;

  @Column({
    default: false,
  })
  public confirmed: boolean;

  @OneToOne(() => Profile, (profile) => profile.user, {
    eager: true,
  })
  profile: Profile;

  @OneToOne(() => ForgottenPasswordEntity, (ForgottenPassword) => ForgottenPassword.user)
  public forgottenPassword: ForgottenPasswordEntity;
}
