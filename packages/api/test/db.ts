import { DeepPartial } from 'typeorm'
import { appDataSource } from '../src/data_source'
import { EntityLabel, LabelSource } from '../src/entity/entity_label'
import { Filter } from '../src/entity/filter'
import { Highlight } from '../src/entity/highlight'
import { Label } from '../src/entity/label'
import { LibraryItem } from '../src/entity/library_item'
import { Reminder } from '../src/entity/reminder'
import { User } from '../src/entity/user'
import { UserDeviceToken } from '../src/entity/user_device_tokens'
import { authTrx, getRepository, setClaims } from '../src/repository'
import { highlightRepository } from '../src/repository/highlight'
import { userRepository } from '../src/repository/user'
import { createUser } from '../src/services/create_user'
import { createOrUpdateLibraryItem } from '../src/services/library_item'
import { createDeviceToken } from '../src/services/user_device_tokens'
import {
  bulkEnqueueUpdateLabels,
  enqueueUpdateHighlight,
} from '../src/utils/createTask'
import { generateFakeUuid, waitUntilJobsDone } from './util'

export const createTestConnection = async (): Promise<void> => {
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
    logger: process.env.PG_LOGGER as
      | 'advanced-console'
      | 'simple-console'
      | 'file'
      | 'debug'
      | undefined,
  })
  await appDataSource.initialize()
}

export const deleteFiltersFromUser = async (userId: string) => {
  await appDataSource.transaction(async (t) => {
    await setClaims(t, userId)
    const filterRepo = t.getRepository(Filter)

    const userFilters = await filterRepo.findBy({ user: { id: userId } })

    await Promise.all(
      userFilters.map((filter) => {
        return filterRepo.delete(filter.id)
      })
    )
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
  const item = {
    user: { id: userId },
    title: 'test title',
    originalContent: '<p>test content</p>',
    originalUrl: `https://blog.omnivore.app/test-url-${generateFakeUuid()}`,
    slug: 'test-with-omnivore',
  }

  const createdItem = await createOrUpdateLibraryItem(
    item,
    userId,
    undefined,
    true,
    true
  )
  if (labels) {
    await saveLabelsInLibraryItem(labels, createdItem.id, userId)
  }

  return createdItem
}

export const saveLabelsInLibraryItem = async (
  labels: Label[],
  libraryItemId: string,
  userId: string,
  source: LabelSource = 'user'
) => {
  await authTrx(
    async (tx) => {
      const repo = tx.getRepository(EntityLabel)

      // delete existing labels
      await repo.delete({
        libraryItemId,
      })

      // save new labels
      await repo.save(
        labels.map((l) => ({
          labelId: l.id,
          libraryItemId,
          source,
        }))
      )
    },
    {
      uid: userId,
    }
  )

  // update labels in library item
  const jobs = await bulkEnqueueUpdateLabels([{ libraryItemId, userId }])

  await waitUntilJobsDone(jobs)
}

export const createHighlight = async (
  highlight: DeepPartial<Highlight>,
  libraryItemId: string,
  userId: string
) => {
  const newHighlight = await authTrx(
    async (tx) => {
      const repo = tx.withRepository(highlightRepository)
      const newHighlight = await repo.createAndSave(highlight)
      return repo.findOneOrFail({
        where: { id: newHighlight.id },
        relations: {
          user: true,
        },
      })
    },
    {
      uid: userId,
    }
  )

  const job = await enqueueUpdateHighlight({
    libraryItemId,
    userId,
  })
  if (job) {
    await waitUntilJobsDone([job])
  }

  return newHighlight
}
