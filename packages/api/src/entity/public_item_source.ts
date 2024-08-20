import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity({ name: 'public_item_source' })
export class PublicItemSource {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column('text')
  type!: string

  @Column('text')
  name!: string

  @Column('text')
  url?: string

  @Column('boolean')
  approved!: boolean

  @Column('text')
  icon?: string

  @Column('text')
  topics?: string[]

  @Column('text')
  languageCodes?: string[]

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
