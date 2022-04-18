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
import { SubscriptionStatus } from '../generated/graphql'

@Entity({ name: 'subscriptions' })
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User

  @Column('text')
  name!: string

  @Column('enum', {
    enum: SubscriptionStatus,
    default: SubscriptionStatus.Active,
  })
  status!: SubscriptionStatus

  @Column('text', { nullable: true })
  description?: string

  @Column('text', { nullable: true })
  url?: string

  @Column('text', { nullable: true })
  unsubscribeMailTo?: string

  @Column('text', { nullable: true })
  unsubscribeHttpUrl?: string

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
