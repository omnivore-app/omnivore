import Postgrator from 'postgrator'
import { FindOptionsWhere } from 'typeorm'
import { SnakeNamingStrategy } from 'typeorm-naming-strategies'
import { Integration } from '../src/entity/integration'
import { Label } from '../src/entity/label'
import { Link } from '../src/entity/link'
import { NewsletterEmail } from '../src/entity/newsletter_email'
import { Page } from '../src/entity/page'
import { Profile } from '../src/entity/profile'
import { Reminder } from '../src/entity/reminder'
import { Subscription } from '../src/entity/subscription'
import { User } from '../src/entity/user'
import { UserDeviceToken } from '../src/entity/user_device_tokens'
import { getRepository, setClaims } from '../src/entity/utils'
import { SubscriptionStatus, SubscriptionType } from '../src/generated/graphql'
import { AppDataSource } from '../src/server'
import { createUser } from '../src/services/create_user'

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

export const createTestConnection = async (): Promise<void> => {
  // need to manually run migrations before creating the connection
  // await runMigrations()

  AppDataSource.setOptions({
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
  await AppDataSource.initialize()
}

export const deleteTestUser = async (userId: string) => {
  await AppDataSource.transaction(async (t) => {
    await setClaims(t, userId)
    await t.getRepository(User).delete(userId)
  })
}

export const createTestUser = async (
  name: string,
  invite?: string | undefined,
  password?: string,
  pendingConfirmation?: boolean
): Promise<User> => {
  const [newUser] = await createUser({
    provider: 'GOOGLE',
    sourceUserId: 'fake-user-id-' + name,
    email: `${name}@omnivore.app`,
    username: name,
    bio: `i am ${name}`,
    name: name,
    inviteCode: invite,
    password: password,
    pendingConfirmation,
  })

  return newUser
}

export const createUserWithoutProfile = async (name: string): Promise<User> => {
  return getRepository(User).save({
    source: 'GOOGLE',
    sourceUserId: 'fake-user-id-' + name,
    email: `${name}@omnivore.app`,
    name: name,
  })
}

export const getProfile = async (user: User): Promise<Profile | null> => {
  return getRepository(Profile).findOneBy({ user: { id: user.id } })
}

export const createTestPage = async (): Promise<Page> => {
  return getRepository(Page).save({
    originalHtml: 'html',
    content: 'Test content',
    description: 'Test description',
    title: 'Test title',
    author: 'Test author',
    url: 'Test url',
    hash: 'Test hash',
  })
}

export const createTestLink = async (user: User, page: Page): Promise<Link> => {
  return getRepository(Link).save({
    user: user,
    page: page,
    slug: 'Test slug',
    articleUrl: 'Test url',
    articleHash: 'Test hash',
  })
}

export const createTestReminder = async (
  user: User,
  pageId?: string
): Promise<Reminder> => {
  return getRepository(Reminder).save({
    user: user,
    elasticPageId: pageId,
    remindAt: new Date(),
  })
}

export const getReminder = async (id: string): Promise<Reminder | null> => {
  return getRepository(Reminder).findOneBy({ id })
}

export const createTestNewsletterEmail = async (
  user: User,
  emailAddress?: string,
  confirmationCode?: string
): Promise<NewsletterEmail> => {
  return getRepository(NewsletterEmail).save({
    user: user,
    address: emailAddress,
    confirmationCode: confirmationCode,
  })
}

export const getNewsletterEmail = async (
  id: string
): Promise<NewsletterEmail | null> => {
  return getRepository(NewsletterEmail).findOneBy({ id })
}

export const createTestDeviceToken = async (
  user: User
): Promise<UserDeviceToken> => {
  return getRepository(UserDeviceToken).save({
    user: user,
    token: 'Test token',
  })
}

export const getDeviceToken = async (
  id: string
): Promise<UserDeviceToken | null> => {
  return getRepository(UserDeviceToken).findOneBy({ id })
}

export const getUser = async (id: string): Promise<User | null> => {
  return getRepository(User).findOneBy({ id })
}

export const getLink = async (id: string): Promise<Link | null> => {
  return getRepository(Link).findOneBy({ id })
}

export const createTestLabel = async (
  user: User,
  name: string,
  color: string
): Promise<Label> => {
  return getRepository(Label).save({
    user,
    name,
    color,
  })
}

export const createTestSubscription = async (
  user: User,
  name: string,
  newsletterEmail?: NewsletterEmail,
  status = SubscriptionStatus.Active,
  unsubscribeMailTo?: string,
  subscriptionType = SubscriptionType.Newsletter
): Promise<Subscription> => {
  return getRepository(Subscription).save({
    user,
    name,
    newsletterEmail,
    status,
    unsubscribeMailTo,
    lastFetchedAt: new Date(),
    type: subscriptionType,
  })
}

export const deleteTestLabels = async (
  userId: string,
  criteria: string[] | FindOptionsWhere<Label>
) => {
  await AppDataSource.transaction(async (t) => {
    await setClaims(t, userId)
    await t.getRepository(Label).delete(criteria)
  })
}

export const deleteTestIntegrations = async (
  userId: string,
  criteria: string[] | FindOptionsWhere<Integration>
) => {
  await AppDataSource.transaction(async (t) => {
    await setClaims(t, userId)
    await t.getRepository(Integration).delete(criteria)
  })
}

export const updateTestUser = async (userId: string, update: Partial<User>) => {
  await AppDataSource.transaction(async (t) => {
    await setClaims(t, userId)
    await t.getRepository(User).update(userId, update)
  })
}

export const deleteTestDeviceTokens = async (
  userId: string,
  criteria: string[] | FindOptionsWhere<UserDeviceToken>
) => {
  await AppDataSource.transaction(async (t) => {
    await setClaims(t, userId)
    await t.getRepository(UserDeviceToken).delete(criteria)
  })
}
