import {
  BaseEntity,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { Link } from './link'
import { Label } from './label'

@Entity({ name: 'link_labels' })
export class LinkLabel extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @ManyToOne(() => Link)
  @JoinColumn({ name: 'link_id' })
  link!: Link

  @ManyToOne(() => Label)
  @JoinColumn({ name: 'label_id' })
  label!: Label

  @CreateDateColumn()
  createdAt!: Date
}
