import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm'
import { User } from '../../user/entities/index'
import { Group, Invite } from './index'

@Entity({ name: 'group_membership', schema: 'omnivore' })
@Unique('group_membership_unique', ['groupId', 'userId'])
export class GroupMembership {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column('uuid', { name: 'user_id' })
  userId!: string

  @Column('uuid', { name: 'group_id' })
  groupId!: string

  @Column('uuid', { name: 'invite_id' })
  inviteId!: string

  @Column('boolean', { name: 'is_admin', default: false })
  isAdmin!: boolean

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User

  @ManyToOne(() => Group, (group) => group.members)
  @JoinColumn({ name: 'group_id' })
  group!: Group

  @ManyToOne(() => Invite, (invite) => invite.memberships)
  @JoinColumn({ name: 'invite_id' })
  invite!: Invite
}
