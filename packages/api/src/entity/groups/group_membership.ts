import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

import { User } from '../user'
import { Group } from './group'
import { Invite } from './invite'

@Entity()
export class GroupMembership {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @OneToOne(() => User)
  @JoinColumn()
  user!: User

  @ManyToOne(() => Group, (group) => group.members)
  @JoinColumn()
  group!: Group

  @OneToOne(() => Invite)
  @JoinColumn()
  invite!: Invite

  @CreateDateColumn()
  createdAt?: Date

  @UpdateDateColumn()
  updatedAt?: Date

  @Column('boolean', { default: false })
  isAdmin!: boolean
}
