import {Column, Entity, JoinColumn, ManyToOne} from "typeorm";
import {BaseEntity} from "~/common/base-entity";
import {UserEntity} from "@user/users.entity";

@Entity('refresh_tokens')
export class RefreshToken extends BaseEntity {

  @Column({ type: 'varchar', nullable: false })
  token: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  expiresIn: Date;

  @ManyToOne(() => UserEntity, user => user.refreshTokens)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column()
  userId: number;
}
