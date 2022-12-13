import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

import { User } from '../user'
import { GroupMembership } from './group_membership'

@Entity()
export class Group {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column('text')
  name!: string

  @OneToOne(() => User)
  @JoinColumn()
  createdBy!: User

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date

  @OneToMany(() => GroupMembership, (groupMembership) => groupMembership.group)
  members!: GroupMembership[]

  @Column('text', { nullable: true })
  description?: string | null

  @Column('text', { nullable: true })
  topics?: string | null

  @Column('boolean', { default: false })
  onlyAdminCanPost!: boolean

  @Column('boolean', { default: false })
  onlyAdminCanSeeMembers!: boolean
}
