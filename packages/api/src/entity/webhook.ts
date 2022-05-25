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

@Entity({ name: 'webhooks' })
export class Webhook {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User

  @Column('text')
  url!: string

  @Column('text', { array: true })
  eventTypes!: string[]

  @Column('text', { default: 'POST' })
  method!: string

  @Column('text', { default: 'application/json' })
  contentType!: string

  @Column('boolean', { default: true })
  enabled!: boolean

  @CreateDateColumn({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date

  @UpdateDateColumn({ default: () => 'CURRENT_TIMESTAMP' })
  updatedAt!: Date
}
