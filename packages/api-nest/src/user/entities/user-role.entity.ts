import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm'
import { User } from './user.entity'
import { Permission, UserRole } from '../enums'

/**
 * UserRole Entity
 *
 * Tracks role assignments and permissions for users
 * Supports future expansion to multiple roles per user if needed
 */
@Entity({ name: 'user_roles', schema: 'omnivore' })
@Index(['userId', 'role'], { unique: true })
export class UserRoleEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column('uuid', { name: 'user_id' })
  userId!: string

  @Column({
    type: 'varchar',
    length: 50,
    name: 'role_name',
  })
  role!: UserRole

  @Column('text', {
    array: true,
    default: '{}',
    name: 'additional_permissions',
  })
  additionalPermissions!: Permission[]

  @Column('text', { nullable: true, name: 'granted_by' })
  grantedBy?: string

  @Column('text', { nullable: true, name: 'reason' })
  reason?: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date

  @Column('timestamptz', { nullable: true, name: 'expires_at' })
  expiresAt?: Date

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User

  // Helper methods
  isExpired(): boolean {
    return this.expiresAt ? new Date() > this.expiresAt : false
  }

  isActive(): boolean {
    return !this.isExpired()
  }
}
