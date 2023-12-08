import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm'
import { User } from './user'

@Entity({ name: 'filters' })
@Unique('filter_unique_key', ['user', 'name'])
export class Filter {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User

  @Column('varchar', { length: 255 })
  name!: string

  @Column('varchar', { length: 255, nullable: true, default: null })
  description?: string | null

  @Column('varchar', { length: 255 })
  filter!: string

  @Column('varchar', { length: 255, default: 'Search' })
  category!: string

  @Column('integer', { default: 0 })
  position!: number

  @CreateDateColumn({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date

  @UpdateDateColumn({ default: () => 'CURRENT_TIMESTAMP' })
  updatedAt!: Date

  @Column('boolean', { default: false })
  defaultFilter!: boolean

  @Column('boolean', { default: true })
  visible!: boolean

  @Column('text')
  folder!: string
}
