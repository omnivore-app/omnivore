import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm'
import { User } from './user.entity'

@Entity({ name: 'user_profile', schema: 'omnivore' })
export class UserProfile {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  // Exact mapping to existing user_profile table (migration 0019)
  @Column('text', { unique: true })
  username!: string

  @Column('boolean', { default: false })
  private!: boolean

  @Column('text', { nullable: true })
  bio?: string

  @Column('text', { nullable: true, name: 'picture_url' })
  pictureUrl?: string

  @Column('uuid', { name: 'user_id' })
  userId!: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date

  @UpdateDateColumn({ nullable: true, name: 'updated_at' })
  updatedAt?: Date

  // Relationship to User
  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User
}
