import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { User } from './user'

@Entity({ name: 'user_personalization' })
export class UserPersonalization {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User

  @Column('text', { nullable: true })
  fontFamily?: string

  @Column('integer', { nullable: true })
  fontSize?: number

  @Column('text', { nullable: true })
  margin?: number

  @Column('text', { nullable: true })
  theme?: string

  @Column('text', { nullable: true })
  libraryLayoutType?: string

  @Column('text', { nullable: true })
  librarySortOrder?: string

  @Column('text', { nullable: true })
  speechVoice?: string

  @Column('text', { nullable: true })
  speechSecondaryVoice?: string

  @Column('text', { nullable: true })
  speechRate?: string

  @Column('text', { nullable: true })
  speechVolume?: string

  @CreateDateColumn({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date

  @UpdateDateColumn({ default: () => 'CURRENT_TIMESTAMP' })
  updatedAt!: Date
}
