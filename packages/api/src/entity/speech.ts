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

export enum SpeechState {
  INITIALIZED = 'INITIALIZED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

@Entity({ name: 'speech' })
export class Speech {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User

  @Column('text')
  elasticPageId!: string

  @Column('text', { default: '' })
  audioFileName!: string

  @Column('text', { default: '' })
  speechMarksFileName!: string

  @Column('text')
  voice!: string

  @Column('enum', { enum: SpeechState, default: SpeechState.INITIALIZED })
  state!: SpeechState

  @CreateDateColumn({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date

  @UpdateDateColumn({ default: () => 'CURRENT_TIMESTAMP' })
  updatedAt!: Date
}
