import Postgrator from 'postgrator'
import { DeepPartial } from 'typeorm'
import { SnakeNamingStrategy } from 'typeorm-naming-strategies'
import { appDataSource } from '../src/data_source'
import { Label } from '../src/entity/label'
import { LibraryItem } from '../src/entity/library_item'
import { Reminder } from '../src/entity/reminder'
import { User } from '../src/entity/user'
import { UserDeviceToken } from '../src/entity/user_device_tokens'
import { getRepository } from '../src/repository'
import { userRepository } from '../src/repository/user'
import { createUser } from '../src/services/create_user'
import { Filter } from "../src/entity/filter"
import { createLibraryItem } from '../src/services/library_item'
import { createDeviceToken } from '../src/services/user_device_tokens'

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

  appDataSource.setOptions({
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
  await appDataSource.initialize()
}

export const deleteFiltersFromUser = async (userId: string) => {
  await AppDataSource.transaction(async (t) => {
    await setClaims(t, userId)
    const filterRepo = t.getRepository(Filter);

    const userFilters = await filterRepo.findBy({ user: { id: userId }})

    await Promise.all(userFilters.map(filter => {
      return filterRepo.delete(filter.id)
    }));
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
  return userRepository.save({
    source: 'GOOGLE',
    sourceUserId: 'fake-user-id-' + name,
    email: `${name}@omnivore.app`,
    name: name,
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

export const createTestDeviceToken = async (
  user: User
): Promise<UserDeviceToken> => {
  return createDeviceToken(user.id, 'fake-token')
}

export const createTestLibraryItem = async (
  userId: string,
  labels?: Label[]
): Promise<LibraryItem> => {
  const item: DeepPartial<LibraryItem> = {
    user: { id: userId },
    title: 'test title',
    originalContent: '<p>test content</p>',
    originalUrl: 'https://blog.omnivore.app/test-url',
    slug: 'test-with-omnivore',
    labels,
  }

  return createLibraryItem(item, userId)
}
