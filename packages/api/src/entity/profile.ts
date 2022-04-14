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

@Entity({ name: 'user_profile' })
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column('text')
  username!: string

  @Column('text')
  bio!: string

  @Column('text')
  pictureUrl!: string

  @OneToOne(() => User, (user) => user.profile)
  @JoinColumn({ name: 'user_id' })
  user!: User

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
