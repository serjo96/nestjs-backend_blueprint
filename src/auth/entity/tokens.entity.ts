import { Entity, Column, OneToOne, JoinColumn } from 'typeorm'
import {UserEntity} from "@user/users.entity";
import {BaseEntity} from "~/common/base-entity";

@Entity()
export class Tokens extends BaseEntity {

  @OneToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: UserEntity

  @Column('text')
  refreshToken: string
}
