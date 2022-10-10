import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  createConnection,
  Connection,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm'
import AdminJs from 'adminjs'
import { Database, Resource } from '@adminjs/typeorm'

export const registerDatabase = async (): Promise<Connection> => {
  AdminJs.registerAdapter({ Database, Resource })

  let host = 'localhost'
  if (process.env.K_SERVICE) {
    console.log(
      'connecting to database via Cloud Run connection',
      process.env.CLOUD_SQL_CONNECTION_NAME,
      process.env.DB_NAME
    )
    const dbSocketPath = process.env.DB_SOCKET_PATH || '/cloudsql'
    host = `${dbSocketPath}/${process.env.CLOUD_SQL_CONNECTION_NAME}`
  }

  console.log('connecting to database:', host)
  const connection = await createConnection({
    type: 'postgres',
    host: host,
    schema: 'omnivore',
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE,
    entities: [AdminUser, User, UserProfile, UserArticle],
  })

  return connection
}

@Entity({ name: 'admin_user' })
export class AdminUser extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id!: string

  @Column({ type: 'text' })
  public email!: string

  @Column({ type: 'text' })
  public password!: string
}

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ type: 'text' })
  public first_name!: string

  @Column({ type: 'text' })
  public last_name!: string

  @Column({ type: 'text' })
  public email!: string

  @Column({ type: 'timestamp' })
  public created_at!: Date

  @Column({ type: 'timestamp' })
  public updated_at!: Date

  @OneToMany(() => UserArticle, (ua) => ua.user)
  articles!: UserArticle[]
}

@Entity()
export class UserProfile extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ type: 'text' })
  public username!: string

  @JoinColumn({ name: 'user_id' })
  @ManyToOne(() => User, (user) => user.articles, { eager: true })
  user!: User
}

@Entity({ name: 'user_articles' })
export class UserArticle extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @JoinColumn({ name: 'user_id' })
  @ManyToOne(() => User, (user) => user.articles, { eager: true })
  user!: User

  @Column({ type: 'text', name: 'article_id' })
  articleId!: string

  @Column({ type: 'text' })
  slug!: string

  @Column({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date

  @Column({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date

  @Column({ type: 'timestamp', name: 'saved_at' })
  savedAt!: Date
}
