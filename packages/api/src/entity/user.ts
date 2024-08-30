import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Label } from './label'
import { NewsletterEmail } from './newsletter_email'
import { Profile } from './profile'
import { Subscription } from './subscription'
import { UserPersonalization } from './user_personalization'

export enum RegistrationType {
  Google = 'GOOGLE',
  Apple = 'APPLE',
  Email = 'EMAIL',
}

export enum StatusType {
  Active = 'ACTIVE',
  Pending = 'PENDING',
  Deleted = 'DELETED',
  Archived = 'ARCHIVED',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column('text')
  name!: string

  @Column({ type: 'enum', enum: RegistrationType })
  source!: string

  @Column('text')
  email!: string

  @Column('text')
  sourceUserId!: string

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date

  @OneToMany(() => NewsletterEmail, (newsletterEmail) => newsletterEmail.user)
  newsletterEmails?: NewsletterEmail[]

  @OneToOne(() => Profile, (profile) => profile.user, {
    eager: true,
    cascade: true,
  })
  profile!: Profile

  @Column('varchar', { length: 255, nullable: true })
  password?: string

  @OneToMany(() => Label, (label) => label.user)
  labels?: Label[]

  @OneToMany(() => Subscription, (subscription) => subscription.user)
  subscriptions?: Subscription[]

  @Column({ type: 'enum', enum: StatusType })
  status!: StatusType

  @OneToOne(
    () => UserPersonalization,
    (userPersonalization) => userPersonalization.user
  )
  userPersonalization?: UserPersonalization
}
