import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { User } from './user'
import { LibraryItem } from './library_item'

@Entity({ name: 'ai_task_requests' })
export class AITaskRequest {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @ManyToOne(() => User)
  user!: User

  @ManyToOne(() => LibraryItem)
  libraryItem!: LibraryItem

  @Column({ type: 'text', name: 'prompt_name', nullable: false })
  promptName!: string

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

  @ManyToOne(() => LibraryItem)
  libraryItem!: LibraryItem

  @Column({ type: 'text', name: 'result_text', nullable: false })
  resultText!: string

  @CreateDateColumn({
    name: 'generated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  generatedAt!: Date
}
