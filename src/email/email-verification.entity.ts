import {Column, Entity, JoinColumn, OneToOne, Relation} from 'typeorm';
import { BaseEntity } from '~/common/base-entity';
import {UserEntity} from "@user/users.entity";

@Entity('email-verification')
export class EmailVerificationEntity extends BaseEntity {
  @Column()
  public token: string;

  @Column({ type: 'timestamp with time zone' })
  expirationDate: Date;

  @OneToOne(() => UserEntity, {
    onDelete: 'CASCADE'
  })
  @JoinColumn()
  user: Relation<UserEntity>;
}
