import { UserEntity } from '~/users/users.entity';
import { Column, Entity, JoinColumn, OneToOne, Relation } from 'typeorm';
import {BaseEntity} from "~/common/base-entity";
import {TokenVerificationEntity} from "~/common/interfaces/TokenVerificationEntity";


@Entity('forgotten-password')
export class ForgottenPasswordEntity extends BaseEntity implements TokenVerificationEntity {
  @Column({
    type: 'varchar',
    nullable: false,
  })
  token: string;

  @Column({ type: 'timestamp with time zone' })
  expirationDate: Date;

  @OneToOne(() => UserEntity, (user) => user.forgottenPassword, {
      onDelete: 'CASCADE',
    })
  @JoinColumn()
  user: Relation<UserEntity>;

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
