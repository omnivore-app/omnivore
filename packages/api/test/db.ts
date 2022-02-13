import { createConnection, getConnection, getManager, getRepository } from "typeorm"
import { SnakeNamingStrategy } from "typeorm-naming-strategies"
import Postgrator from "postgrator"
import { User } from "../src/entity/user"
import { createUser } from "../src/services/create_user"
import { Profile } from "../src/entity/profile"
import { Page } from "../src/entity/page"
import { Link } from "../src/entity/link"
import { Reminder } from "../src/entity/reminder"
import { NewsletterEmail } from "../src/entity/newsletter_email"
import { UserDeviceToken } from "../src/entity/user_device_tokens"

const runMigrations = async () => {
  const migrationDirectory = __dirname + '/../../db/migrations'
  console.log(
    'running migrations from',
    migrationDirectory,
    'into database',
    process.env.PG_DB
  )

  const postgrator = new Postgrator({
    migrationDirectory: migrationDirectory,
    driver: 'pg',
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    username: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DB,
    schemaTable: 'schemaversion',
    validateChecksums: true,
  })

  const migrations = await postgrator.migrate('max')
  for (const migration of migrations) {
    console.log(` - ${migration.action} ${migration.name}`)
  }
}

const createEntityConnection = async (): Promise<void> => {
  await createConnection({
    type: 'postgres',
    host: process.env.PG_HOST,
    port: Number(process.env.PG_PORT),
    schema: 'omnivore',
    username: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DB,
    logging: ['query', 'info'],
    entities: [__dirname + '/../src/entity/**/*{.js,.ts}'],
    subscribers: [__dirname + '/../src/events/**/*{.js,.ts}'],
    namingStrategy: new SnakeNamingStrategy(),
  })
}

export const createTestConnection = async (): Promise<void> => {
  try {
    getConnection()
    // eslint-disable-next-line no-empty
  } catch (error) {}

  await runMigrations()
  await createEntityConnection()
}

export const deleteTestUser = async (name: string) => {
  await getConnection()
    .createQueryBuilder()
    .delete()
    .from(User)
    .where({ email: `${name}@fake.com` })
    .execute()
}

export const createTestUser = async (
  name: string,
  invite?: string | undefined,
  password?: string
): Promise<User> => {
  const [newUser] = await createUser({
    provider: 'GOOGLE',
    sourceUserId: 'fake-user-id-' + name,
    email: `${name}@fake.com`,
    username: name,
    bio: `i am ${name}`,
    name: name,
    inviteCode: invite,
    password: password,
  })
  return newUser
}

export const createUserWithoutProfile = async (name: string): Promise<User> => {
  return getManager()
    .getRepository(User)
    .create({
      source: 'GOOGLE',
      sourceUserId: 'fake-user-id-' + name,
      email: `${name}@fake.com`,
      name: name,
    })
    .save()
}

export const getProfile = async (user: User): Promise<Profile | undefined> => {
  return Profile.findOne({ where: { user: user } })
}

export const createTestPage = async (): Promise<Page> => {
  return getRepository(Page)
    .create({
      originalHtml: 'html',
      content: 'Test content',
      description: 'Test description',
      title: 'Test title',
      author: 'Test author',
      url: 'Test url',
      hash: 'Test hash',
    })
    .save()
}

export const createTestLink = async (user: User, page: Page): Promise<Link> => {
  return getRepository(Link)
    .create({
      user: user,
      page: page,
      slug: 'Test slug',
      articleUrl: 'Test url',
      articleHash: 'Test hash',
    })
    .save()
}

export const createTestReminder = async (
  user: User,
  link?: string
): Promise<Reminder> => {
  return getRepository(Reminder)
    .create({
      user: user,
      link: link,
      remindAt: new Date(),
    })
    .save()
}

export const getReminder = async (
  id: string
): Promise<Reminder | undefined> => {
  return getRepository(Reminder).findOne(id)
}

export const createTestNewsletterEmail = async (
  user: User,
  emailAddress?: string,
  confirmationCode?: string
): Promise<NewsletterEmail> => {
  return getRepository(NewsletterEmail)
    .create({
      user: user,
      address: emailAddress,
      confirmationCode: confirmationCode,
    })
    .save()
}

export const getNewsletterEmail = async (
  id: string
): Promise<NewsletterEmail | undefined> => {
  return getRepository(NewsletterEmail).findOne(id)
}

export const createTestDeviceToken = async (
  user: User
): Promise<UserDeviceToken> => {
  return getRepository(UserDeviceToken)
    .create({
      user: user,
      token: 'Test token',
    })
    .save()
}

export const getDeviceToken = async (
  id: string
): Promise<UserDeviceToken | undefined> => {
  return getRepository(UserDeviceToken).findOne(id)
}

export const getUser = async (id: string): Promise<User | undefined> => {
  return getRepository(User).findOne(id)
}
