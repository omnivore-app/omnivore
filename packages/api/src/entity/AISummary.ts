import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { User } from './user'
import { LibraryItem } from './library_item'

@Entity({ name: 'ai_summaries' })
export class AISummary {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User

  @ManyToOne(() => LibraryItem)
  @JoinColumn({ name: 'library_item_id' })
  libraryItem!: LibraryItem

  @Column('text')
  summary?: string

  @Column('text')
  title?: string

  @Column('text')
  slug?: string

  @CreateDateColumn({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date
}
