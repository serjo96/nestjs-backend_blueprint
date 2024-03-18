import { Column, Entity, Index, JoinColumn, OneToOne } from 'typeorm';

import {UserEntity} from './users.entity';
import {BaseEntity} from "~/common/base-entity";

@Entity('profiles')
export class Profile extends BaseEntity {
  @Column({
    nullable: true,
  })
  public name: string;

  @Column({
    type: 'date',
    nullable: true
  })
  birthday: Date;

  @Column({ nullable: true })
  photoUrl: string;

  @OneToOne(() => UserEntity, (user) => user.profile)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column({
    type: 'uuid',
    nullable: false,
  })
  @Index()
  userId: string;
}
