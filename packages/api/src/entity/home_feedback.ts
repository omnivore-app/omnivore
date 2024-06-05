import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { User } from './user'

export enum HomeFeedbackType {
  More = 'MORE',
  Less = 'LESS',
}

@Entity({ name: 'home_feedback' })
export class HomeFeedback {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User

  @Column('text', { nullable: true })
  subscription?: string | null

  @Column('text', { nullable: true })
  author?: string | null

  @Column('text', { nullable: true })
  site?: string | null

  @Column('enum', {
    enum: HomeFeedbackType,
  })
  feedbackType!: HomeFeedbackType

  @CreateDateColumn({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date
}
