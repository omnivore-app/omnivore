import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { ReportType } from '../../generated/graphql'

@Entity()
export class AbuseReport {
  @PrimaryGeneratedColumn('uuid')
  id?: string

  @Column('text')
  libraryItemId?: string

  @Column('text')
  sharedBy!: string

  @Column('text')
  itemUrl!: string

  @Column('text')
  reportedBy!: string

  @Column('enum', { enum: ReportType, array: true })
  reportTypes!: ReportType[]

  @Column('text')
  reportComment!: string

  @CreateDateColumn()
  createdAt?: Date

  @UpdateDateColumn()
  updatedAt?: Date
}
