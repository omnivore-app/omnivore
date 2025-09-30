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

@Entity({ name: 'user_personalization', schema: 'omnivore' })
export class UserPersonalization {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  // Exact mapping to existing user_personalization table (migration 0008 + subsequent)
  @Column('uuid', { unique: true })
  userId!: string

  @Column('integer', {name: 'font_size', nullable: true })
  fontSize?: number

  @Column('text', { name: 'font_family', nullable: true })
  fontFamily?: string

  @Column('text', { name: 'theme', nullable: true })
  theme?: string

  @Column('integer', { name: 'margin', nullable: true }) // Added in migration 0013
  margin?: number

  @Column('text', { name: 'library_layout_type', nullable: true }) // Added in migration 0026
  libraryLayoutType?: string

  @Column('text', { name: 'library_sort_order', nullable: true }) // Added in migration 0032
  librarySortOrder?: string

  @Column('json', { name: 'fields', nullable: true }) // Added in migration 0145
  fields?: any

  @Column('jsonb', { name: 'digest_config', nullable: true }) // Added in migration 0174
  digestConfig?: any

  @Column('json', { name: 'shortcuts', nullable: true }) // Added in migration 0180
  shortcuts?: any

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date

  // Relationship to User
  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User
}
