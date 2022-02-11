import {
  Entity,
  BaseEntity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm'

import { User } from '../user'

@Entity()
export class Group extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id?: string

  @Column('text')
  name!: string

  @OneToOne(() => User)
  @JoinColumn()
  createdBy!: User

  @CreateDateColumn()
  createdAt?: Date

  @UpdateDateColumn()
  updatedAt?: Date
}
