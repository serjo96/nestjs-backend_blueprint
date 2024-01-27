import { Column, Entity } from 'typeorm';
import { BaseEntity } from '~/common/base-entity';

@Entity('email-verification')
export class EmailVerificationEntity extends BaseEntity {
  @Column({
    type: 'varchar',
    nullable: false,
  })
  email: string;

  @Column()
  public emailToken: string;

  @Column({
    type: 'timestamptz',
  })
  public timestamp: Date;
}
