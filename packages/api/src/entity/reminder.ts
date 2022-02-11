import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { User } from './user'

@Entity({ name: 'reminders' })
export class Reminder extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User

  @Column('uuid', { name: 'article_saving_request_id' })
  articleSavingRequest?: string

  @Column('uuid', { name: 'link_id' })
  link?: string

  @Column('boolean')
  archiveUntil?: boolean

  @Column('boolean')
  sendNotification?: boolean

  @Column('text')
  taskName?: string

  @Column('text')
  status?: string

  @Column('timestamp')
  remindAt!: Date

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt?: Date
}
