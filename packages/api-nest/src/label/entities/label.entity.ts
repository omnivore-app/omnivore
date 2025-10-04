import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm'
import { User } from '../../user/entities/user.entity'
import { EntityLabel } from './entity-label.entity'

@Entity('labels', { schema: 'omnivore' })
export class Label {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User

  @Column({ type: 'text' })
  name!: string

  @Column({ type: 'text', default: '#000000' })
  color!: string

  @Column({ type: 'text', nullable: true })
  description?: string | null

  @Column({ type: 'integer', default: 0 })
  position!: number

  @Column({ type: 'boolean', default: false })
  internal!: boolean

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date

  @OneToMany(() => EntityLabel, (entityLabel) => entityLabel.label)
  entityLabels!: EntityLabel[]
}
