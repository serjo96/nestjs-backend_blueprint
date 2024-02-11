import * as bcrypt from 'bcryptjs';
import {BeforeInsert, BeforeUpdate, Column, Entity, Index, OneToMany, OneToOne} from 'typeorm';

import {BaseEntity} from '~/common/base-entity';
import {Profile} from './profiles.entity';
import {ForgottenPasswordEntity} from "~/auth/entity/forgotten-password.entity";
import {RefreshToken} from "~/auth/entity/refresh-token.entity";

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
  })
  @Index()
  public email: string;

  @Column({
    nullable: true,
  })
  public nickname?: string;

  @Column({
    type: 'varchar',
    nullable: false,
    select: true,
  })
  public password: string;

  @BeforeInsert()
  @BeforeUpdate()
  private async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  @Column({
    default: RolesEnum.USER,
    type: 'varchar'
  })
  public roles: RolesEnum;

  @Column({
    default: false,
  })
  public confirmed: boolean;

  @Column({
    type: 'timestamp with time zone',
    nullable: true
  })
 public lastActiveAt: Date;

  @OneToOne(() => Profile, (profile) => profile.user, {
    eager: true,
  })
  profile: Profile;

  @OneToOne(() => ForgottenPasswordEntity, (ForgottenPassword) => ForgottenPassword.user)
  public forgottenPassword: ForgottenPasswordEntity;

  @OneToMany(() => RefreshToken, refreshToken => refreshToken.user)
  refreshTokens: RefreshToken[];
}
