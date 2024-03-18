import * as bcrypt from 'bcryptjs';
import {BeforeInsert, BeforeUpdate, Column, Entity, Index, OneToMany, OneToOne} from 'typeorm';

import {BaseEntity} from '~/common/base-entity';
import {Profile} from './profiles.entity';
import {ForgottenPasswordEntity} from "~/auth/entities/forgotten-password.entity";
import {RefreshToken} from "~/auth/entities/refresh-token.entity";
import {EmailVerificationEntity} from "~/auth/entities/email-verification.entity";

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
    cascade: ['insert', 'update'],
    eager: true,
  })
  public profile: Profile;

  @OneToOne(() => ForgottenPasswordEntity, (ForgottenPassword) => ForgottenPassword.user)
  public forgottenPassword: ForgottenPasswordEntity;

  @OneToOne(() => EmailVerificationEntity, (emailVerification) => emailVerification.user)
  public emailVerification: EmailVerificationEntity;

  @OneToMany(() => RefreshToken, refreshToken => refreshToken.user)
  public refreshTokens: RefreshToken[];
}
