import { Column, Entity, Index, JoinColumn, OneToOne } from 'typeorm';

import { BaseEntity } from '../common/base-entity';

import { UserEntity } from './users.entity';

@Entity('profiles')
export class Profile extends BaseEntity {
  @Column({
    nullable: true,
  })
  public name: string;

  @OneToOne((type) => UserEntity, (user) => user.profile)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column({
    type: 'uuid',
    nullable: false,
  })
  @Index()
  userId: string;
}
