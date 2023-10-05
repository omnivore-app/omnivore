import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { User } from '../user'

@Entity()
export class ContentDisplayReport {
  @PrimaryGeneratedColumn('uuid')
  id?: string

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User

  @Column('text')
  libraryItemId?: string

  @Column('text')
  content!: string

  @Column('text')
  originalHtml!: string | undefined

  @Column('text')
  originalUrl!: string

  @Column('text')
  reportComment!: string

  @CreateDateColumn()
  createdAt?: Date

  @UpdateDateColumn()
  updatedAt?: Date
}
