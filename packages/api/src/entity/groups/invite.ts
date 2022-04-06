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
import { Group } from './group'

@Entity()
export class Invite {
  @PrimaryGeneratedColumn('uuid')
  id?: string

  @Column('text')
  code!: string

  @OneToOne(() => User)
  @JoinColumn()
  createdBy!: User

  @OneToOne(() => Group)
  @JoinColumn()
  group!: Group

  @Column('integer')
  maxMembers!: number

  @Column('timestamp')
  expirationTime!: Date

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
