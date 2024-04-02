import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { User } from './user'
import { LibraryItem } from './library_item'

@Entity({ name: 'ai_prompts' })
export class Prompt {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ type: 'text', name: 'name', nullable: false, unique: true })
  name!: string

  @Column({ type: 'text', name: 'display_text', nullable: false })
  displayText!: string

  @Column({ type: 'text', name: 'template', nullable: false })
  template!: string

  @Column('text', { array: true, nullable: true })
  variables!: string
}

@Entity({ name: 'ai_task_requests' })
export class AITaskRequest {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User

  @ManyToOne(() => LibraryItem, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'library_item_id' })
  libraryItem!: LibraryItem

  @OneToOne(() => Prompt)
  @JoinColumn({ name: 'prompt_name', referencedColumnName: 'name' })
  prompt!: Prompt

  @Column({ type: 'text', name: 'extra_text', nullable: true })
  extraText!: string

  @CreateDateColumn({
    name: 'requested_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  requestedAt!: Date
}

@Entity({ name: 'ai_task_results' })
export class AITaskResult {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @ManyToOne(() => AITaskRequest)
  request!: AITaskRequest

  @ManyToOne(() => User)
  user!: User

  @Column({ type: 'text', name: 'result_text', nullable: false })
  resultText!: string

  @CreateDateColumn({
    name: 'generated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  generatedAt!: Date
}
