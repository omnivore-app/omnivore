import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'entity_labels' })
export class EntityLabel {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column('uuid')
  labelId!: string

  @Column('uuid')
  libraryItemId?: string | null

  @Column('uuid')
  highlightId?: string | null
}
