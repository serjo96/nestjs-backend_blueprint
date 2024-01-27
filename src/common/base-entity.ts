import { IsDate } from 'class-validator';
import { BaseEntity as Base, BeforeInsert, CreateDateColumn, DeleteDateColumn, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { v4 as uuid4 } from 'uuid';

export abstract class BaseEntity extends Base {
  @PrimaryColumn('uuid')
  public id: string;

  @CreateDateColumn({
    type: 'timestamptz',
  })
  @IsDate()
  public createdAt: Date;

  @UpdateDateColumn({
    nullable: true,
    type: 'timestamptz',
  })
  @IsDate()
  public updatedAt: Date;

  @DeleteDateColumn({
    nullable: true,
    type: 'timestamptz',
  })
  @IsDate()
  public deletedAt: Date;

  @BeforeInsert()
  public baseEntityOnCreate(): void {
    if (!this.id) {
      this.id = uuid4();
    }
  }
}
