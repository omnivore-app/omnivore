import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity({ name: 'public_item_stats' })
export class PublicItemStats {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column('uuid')
  publicItemId!: string

  @Column('integer')
  saveCount!: number

  @Column('integer')
  likeCount!: number

  @Column('integer')
  broadcastCount!: number

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
