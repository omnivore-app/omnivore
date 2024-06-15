import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { User } from './user'

@Entity({ name: 'post' })
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column('uuid')
  userId!: string

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User

  @Column('uuid', { array: true })
  libraryItemIds!: string[]

  @Column('uuid', { array: true })
  highlightIds!: string[]

  @Column('text')
  title!: string

  @Column('text')
  content!: string

  @Column('text', { nullable: true })
  thumbnail?: string

  @Column('text', { nullable: true })
  thought?: string

  @Column('timestamptz')
  createdAt!: Date

  @Column('timestamptz')
  updatedAt!: Date
}
