import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class Topic {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column('text')
  name!: string

  @Column('text')
  description?: string

  @Column('text')
  embedding?: number[]

  @Column('timestamptz')
  createdAt!: Date
}
