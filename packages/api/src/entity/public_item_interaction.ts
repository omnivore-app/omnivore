import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { PublicItem } from './public_item'
import { User } from './user'

@Entity({ name: 'public_item_interactions' })
export class PublicItemInteraction {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @ManyToOne(() => PublicItem, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'public_item_id' })
  publicItem!: PublicItem

  @Column('uuid')
  publicItemId!: string

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User

  @Column('timestamptz')
  seenAt!: Date

  @Column('timestamptz')
  savedAt?: Date

  @Column('timestamptz')
  likedAt?: Date

  @Column('timestamptz')
  broadcastedAt?: Date

  @Column('timestamptz')
  createdAt!: Date

  @Column('timestamptz')
  updated!: Date

  @Column('timestamptz')
  digested?: Date
}
