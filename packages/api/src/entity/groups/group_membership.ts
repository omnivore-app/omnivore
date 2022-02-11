import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm'

import { User } from '../user'
import { Group } from './group'
import { Invite } from './invite'

@Entity()
export class GroupMembership extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id?: string

  @OneToOne(() => User)
  @JoinColumn()
  user!: User

  @OneToOne(() => Group)
  @JoinColumn()
  group!: Group

  @OneToOne(() => Invite)
  @JoinColumn()
  invite!: Invite

  @CreateDateColumn()
  createdAt?: Date

  @UpdateDateColumn()
  updatedAt?: Date
}
