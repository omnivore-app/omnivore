import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { User } from './user'
import { Page } from './page'

@Entity({ name: 'highlight' })
export class Highlight {
  @PrimaryGeneratedColumn('uuid')
  id?: string

  @Column({ type: 'varchar', length: 14 })
  shortId!: string

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User

  @OneToOne(() => Page)
  @JoinColumn({ name: 'article_id' })
  page!: Page

  @Column('text')
  quote!: string

  @Column({ type: 'varchar', length: 5000 })
  prefix?: string

  @Column({ type: 'varchar', length: 5000 })
  suffix?: string

  @Column('text')
  patch!: string

  @Column('text')
  annotation?: string

  @Column('boolean')
  deleted?: boolean

  @CreateDateColumn()
  createdAt?: Date

  @UpdateDateColumn()
  updatedAt?: Date

  @Column('timestamp')
  sharedAt?: Date
}
