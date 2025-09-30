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
import { Invite, GroupMembership } from './index'

@Entity({ name: 'group', schema: 'omnivore' })
export class Group {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column('uuid', { name: 'created_by_id' })
  createdById!: string

  @Column('text')
  name!: string

  @Column('text', { nullable: true })
  description?: string

  @Column('text', { nullable: true })
  topics?: string

  @Column('boolean', { name: 'only_admin_can_post', default: false })
  onlyAdminCanPost!: boolean

  @Column('boolean', { name: 'only_admin_can_see_members', default: false })
  onlyAdminCanSeeMembers!: boolean

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_id' })
  createdBy!: User

  @OneToMany(() => Invite, (invite) => invite.group)
  invites!: Invite[]

  @OneToMany(() => GroupMembership, (membership) => membership.group)
  members!: GroupMembership[]
}
