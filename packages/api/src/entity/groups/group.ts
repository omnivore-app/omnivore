import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

import { User } from '../user'

@Entity()
export class Group {
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
