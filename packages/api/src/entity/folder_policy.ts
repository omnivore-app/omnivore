import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { User } from './user'

export enum FolderPolicyAction {
  DELETE = 'DELETE',
  ARCHIVE = 'ARCHIVE',
}

@Entity({ name: 'folder_policy' })
export class FolderPolicy {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column('uuid')
  userId!: string

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User

  @Column('text')
  folder!: string

  @Column('enum', { enum: FolderPolicyAction })
  action!: FolderPolicyAction

  @Column('int')
  afterDays!: number

  @Column('int')
  minimumItems!: number

  @CreateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date

  @UpdateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt!: Date
}
