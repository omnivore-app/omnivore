/*
CREATE TABLE omnivore.export (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v1mc(),
    user_id UUID NOT NULL REFERENCES omnivore.user(id) ON DELETE CASCADE,
    task_id TEXT NOT NULL,
    state TEXT NOT NULL,
    total_items INT DEFAULT 0,
    processed_items INT DEFAULT 0,
    signed_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
*/

import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity()
export class Export {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column('uuid')
  userId!: string

  @Column('text')
  taskId!: string

  @Column('text')
  state!: string

  @Column('int', { default: 0 })
  totalItems!: number

  @Column('int', { default: 0 })
  processedItems!: number

  @Column('text', { nullable: true })
  signedUrl?: string

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date
}
