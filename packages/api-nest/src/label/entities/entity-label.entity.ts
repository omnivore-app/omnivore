import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { Label } from './label.entity'
import { LibraryItemEntity } from '../../library/entities/library-item.entity'

@Entity('entity_labels', { schema: 'omnivore' })
export class EntityLabel {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'library_item_id', type: 'uuid', nullable: true })
  libraryItemId?: string | null

  @ManyToOne(() => LibraryItemEntity)
  @JoinColumn({ name: 'library_item_id' })
  libraryItem?: LibraryItemEntity | null

  @Column({ name: 'highlight_id', type: 'uuid', nullable: true })
  highlightId?: string | null

  @Column({ name: 'label_id', type: 'uuid' })
  labelId!: string

  @ManyToOne(() => Label, (label) => label.entityLabels)
  @JoinColumn({ name: 'label_id' })
  label!: Label

  @Column({ type: 'text', default: 'user' })
  source!: string
}
