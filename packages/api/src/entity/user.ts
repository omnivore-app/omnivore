import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { MembershipTier, RegistrationType } from '../datalayer/user/model'
import { NewsletterEmail } from './newsletter_email'
import { Profile } from './profile'
import { Label } from './label'

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

  @Column({ type: 'enum', enum: MembershipTier })
  membership!: string

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date

  @OneToMany(() => NewsletterEmail, (newsletterEmail) => newsletterEmail.user)
  newsletterEmails?: NewsletterEmail[]

  @OneToOne(() => Profile, (profile) => profile.user)
  profile!: Profile

  @Column('varchar', { length: 255, nullable: true })
  password?: string

  @OneToMany(() => Label, (label) => label.user)
  labels?: Label[]
}
