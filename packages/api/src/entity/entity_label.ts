import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { Label } from './label'

// for labels created by rules, we use the rule name as the source, for example: 'rule:my-rule'
// for labels created by users, we use 'user'
// for labels created by system, we use 'system'
type RuleSourceType = `rule:${string}`
export type LabelSource = 'user' | 'system' | RuleSourceType

export const isLabelSource = (source: string): source is LabelSource => {
  return ['user', 'system'].indexOf(source) !== -1 || source.startsWith('rule:')
}

@Entity({ name: 'entity_labels' })
export class EntityLabel {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column('uuid')
  labelId!: string

  @ManyToOne(() => Label)
  @JoinColumn({ name: 'label_id' })
  label!: Label

  @Column('uuid')
  libraryItemId?: string | null

  @Column('uuid')
  highlightId?: string | null

  @Column('text', { default: 'user' })
  source!: LabelSource
}
