import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
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

  @ManyToMany(() => Link, (link) => link.labels)
  @JoinTable({ name: 'link_labels' })
  link?: Link

  @Column('text')
  color!: string

  @Column('text')
  description?: string

  @CreateDateColumn()
  createdAt!: Date
}
