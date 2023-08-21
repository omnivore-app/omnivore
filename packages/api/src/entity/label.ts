import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { LibraryItem } from './library_item'
import { User } from './user'

@Entity({ name: 'labels' })
export class Label {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column('text')
  name!: string

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User

  @Column('text')
  color!: string

  @Column('text', { nullable: true })
  description?: string | null

  @CreateDateColumn()
  createdAt!: Date

  @Column('integer', { default: 0 })
  position!: number

  @Column('boolean', { default: false })
  internal!: boolean

  @ManyToMany(() => LibraryItem, (libraryItem) => libraryItem.labels)
  @JoinTable()
  libraryItems?: LibraryItem[]
}
