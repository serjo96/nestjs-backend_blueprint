import { UserEntity } from '~/users/users.entity';
import { Column, Entity, JoinColumn, OneToOne, Relation } from 'typeorm';
import {UTCDateColumn} from "~/common/decorators/utc-date.decorator";
import {BaseEntity} from "~/common/base-entity";


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

  @Column({ type: 'timestamp with time zone' })
  expirationDate: Date;


  @Column({
    type: 'int',
    default: 0,
  })
  attempts: number;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
  })
  lastAttemptDate: Date | null;

}
