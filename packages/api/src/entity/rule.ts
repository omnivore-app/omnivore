import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { User } from './user'

export enum RuleActionType {
  AddLabel = 'ADD_LABEL',
  Archive = 'ARCHIVE',
  Delete = 'DELETE',
  MarkAsRead = 'MARK_AS_READ',
  SendNotification = 'SEND_NOTIFICATION',
  Webhook = 'WEBHOOK',
  Export = 'EXPORT',
}

export enum RuleEventType {
  PageCreated = 'PAGE_CREATED',
  PageUpdated = 'PAGE_UPDATED',
  LabelCreated = 'LABEL_CREATED',
  HighlightCreated = 'HIGHLIGHT_CREATED',
  HighlightUpdated = 'HIGHLIGHT_UPDATED',
}

export interface RuleAction {
  type: RuleActionType
  params: string[]
}

@Entity({ name: 'rules' })
export class Rule {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User

  @Column('text')
  name!: string

  @Column('text')
  filter!: string

  @Column('simple-json')
  actions!: RuleAction[]

  @Column('text', { nullable: true })
  description?: string | null

  @Column('text', { array: true })
  eventTypes!: RuleEventType[]

  @Column('boolean', { default: true })
  enabled!: boolean

  @CreateDateColumn({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date

  @UpdateDateColumn({ default: () => 'CURRENT_TIMESTAMP' })
  updatedAt!: Date

  @Column('timestamptz')
  failedAt?: Date
}
