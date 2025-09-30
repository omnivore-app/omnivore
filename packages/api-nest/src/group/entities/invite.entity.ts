import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm'
import { User } from '../../user/entities/index'
import { Group, GroupMembership } from './index'

@Entity({ name: 'invite', schema: 'omnivore' })
export class Invite {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column('uuid', { name: 'group_id' })
  groupId!: string

  @Column('uuid', { name: 'created_by_id' })
  createdById!: string

  @Column('text')
  code!: string

  @Column('integer', { name: 'max_members' })
  maxMembers!: number

  @Column('timestamptz', { name: 'expiration_time' })
  expirationTime!: Date

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date

  @ManyToOne(() => Group, (group) => group.invites)
  @JoinColumn({ name: 'group_id' })
  group!: Group

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_id' })
  createdBy!: User

  @OneToMany(() => GroupMembership, (membership) => membership.invite)
  memberships!: GroupMembership[]
}
