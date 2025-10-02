import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  Index,
} from 'typeorm'
import { UserRole } from '../enums/user-role.enum'

export enum StatusType {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  ARCHIVED = 'ARCHIVED',
}

export enum RegistrationType {
  EMAIL = 'EMAIL',
  GOOGLE = 'GOOGLE',
  TWITTER = 'TWITTER',
  APPLE = 'APPLE',
}

@Entity({ name: 'user', schema: 'omnivore' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  // Existing columns from migration 0001 + subsequent migrations
  @Column('text', { name: 'first_name', nullable: true })
  firstName?: string

  @Column('text', { name: 'last_name', nullable: true })
  lastName?: string

  @Column({ type: 'enum', enum: RegistrationType })
  source!: RegistrationType

  @Index('idx_user_email') // Add index for faster login lookups
  @Column('text', { name: 'email', nullable: true })
  email?: string

  @Column('text', { nullable: true })
  phone?: string

  @Column('text', { name: 'source_user_id', unique: true })
  sourceUserId!: string

  @Column('text', { name: 'name', nullable: true })
  name?: string

  @Column('varchar', { length: 255, name: 'password', nullable: true }) // Added in migration 0067
  password?: string

  @Column({
    type: 'enum',
    enum: StatusType,
    default: StatusType.ACTIVE,
    name: 'status',
  }) // Added in migration 0088
  status!: StatusType

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at' }) // Added in migration 0014
  updatedAt!: Date

  // NEW: Enhanced role system - will be added via new migration
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
    nullable: true, // Make nullable initially for existing records
    name: 'role',
  })
  role?: UserRole

  // TODO: Enable when Profile table is properly set up
  // @OneToOne(() => Profile, (profile) => profile.user, {
  //   eager: true,
  //   cascade: true,
  // })
  // profile!: Profile

  // Helper methods
  hasRole(role: UserRole): boolean {
    return this.role === role
  }

  isActive(): boolean {
    return this.status === StatusType.ACTIVE
  }

  isSuspended(): boolean {
    return this.role === UserRole.SUSPENDED
  }

  isPending(): boolean {
    return this.status === StatusType.PENDING
  }

  canAccess(): boolean {
    return this.isActive() && !this.isSuspended() && !this.isPending()
  }
}
