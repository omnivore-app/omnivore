import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { LibraryItem } from './library_item'
import { User } from './user'

@Entity({ name: 'library_item_preview' })
export class LibraryItemPreview {
  @PrimaryGeneratedColumn('uuid')
  id?: string

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sender_id' })
  sender!: User

  @Column('text', { name: 'recipient_ids', array: true })
  recipientIds!: string[]

  @OneToOne(() => LibraryItem, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'library_item_id' })
  libraryItem!: LibraryItem

  @Column('text')
  thumbnail?: string

  @Column('bool', { default: false })
  includesNote?: boolean

  @Column('bool', { default: false })
  includesHighlight?: boolean

  @CreateDateColumn()
  createdAt?: Date

  @UpdateDateColumn()
  updatedAt?: Date
}
