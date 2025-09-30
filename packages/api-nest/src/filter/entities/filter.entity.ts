import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { User } from '../../user/entities/index'

@Entity({ name: 'filters', schema: 'omnivore' })
export class Filter {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column('uuid', { name: 'user_id' })
  userId!: string

  @Column('varchar', { length: 255 })
  name!: string

  @Column('varchar', { length: 255, nullable: true })
  description?: string

  @Column('varchar', { length: 255 })
  filter!: string

  @Column('integer', { default: 0 })
  position!: number

  @Column('varchar', { length: 255 })
  category!: string

  @Column('boolean', { name: 'default_filter', default: false })
  defaultFilter!: boolean

  @Column('boolean', { default: true })
  visible!: boolean

  @Column('text', { default: 'inbox' })
  folder!: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User
}
