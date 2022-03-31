import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'

import { User } from './user'

@Entity({ name: 'user_friends' })
export class Follower {
  @PrimaryGeneratedColumn('uuid')
  id?: string

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User

  @OneToOne(() => User)
  @JoinColumn({ name: 'friend_user_id' })
  followee!: User

  @CreateDateColumn()
  createdAt?: Date
}
