import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { LibraryItem } from './library_item'
import { User } from './user'

@Entity()
export class Recommendation {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recommender_id' })
  recommender!: User

  @ManyToOne(() => LibraryItem, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'library_item_id' })
  libraryItem!: LibraryItem

  @Column('text', { nullable: true })
  note?: string | null

  @CreateDateColumn()
  createdAt!: Date
}
