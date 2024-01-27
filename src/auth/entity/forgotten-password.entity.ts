import { UserEntity } from '~/users/users.entity';
import { Column, Entity, JoinColumn, OneToOne, Relation } from 'typeorm';

import { BaseEntity } from '../common/base-entity';
import { UTCDateColumn } from '../common/decorators/utc-date.decorator';

@Entity('forgotten-password')
export class ForgottenPasswordEntity extends BaseEntity {
  @Column({
    type: 'varchar',
    nullable: false,
  })
  token: string;

  @OneToOne(() => UserEntity, (user) => user.forgottenPassword)
  @JoinColumn()
  user: Relation<UserEntity>;

  @UTCDateColumn({
    type: 'timestamp',
    nullable: false,
  })
  timestamp: Date;
}
