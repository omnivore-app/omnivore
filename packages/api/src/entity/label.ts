import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { User } from './user'
import { Link } from './link'

@Entity({ name: 'labels' })
export class Label extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column('text')
  name!: string

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User

  @ManyToOne(() => Link)
  @JoinColumn({ name: 'link_id' })
  link!: Link

  @CreateDateColumn()
  createdAt!: Date
}
