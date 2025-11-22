import { randomUUID } from 'crypto'
import { INestApplication } from '@nestjs/common'
import { getRepositoryToken } from '@nestjs/typeorm'
import request from 'supertest'
import { Repository } from 'typeorm'
import { createE2EAppWithModule } from './helpers/create-e2e-app'
import {
  ContentReaderType,
  LibraryItemEntity,
  LibraryItemState,
} from '../src/library/entities/library-item.entity'
import { FOLDERS } from '../src/constants/folders.constants'

const LIBRARY_ITEMS_QUERY = `
  query LibraryItems($first: Int, $after: String, $search: LibrarySearchInput) {
    libraryItems(first: $first, after: $after, search: $search) {
      items {
        id
        title
        slug
        originalUrl
        state
        folder
        author
        description
      }
      nextCursor
    }
  }
`

const LIBRARY_ITEM_QUERY = `
  query LibraryItem($id: String!) {
    libraryItem(id: $id) {
      id
      title
      originalUrl
    }
  }
`

const ARCHIVE_LIBRARY_ITEM_MUTATION = `
  mutation ArchiveLibraryItem($id: String!, $archived: Boolean!) {
    archiveLibraryItem(id: $id, archived: $archived) {
      id
      state
      folder
    }
  }
`

const DELETE_LIBRARY_ITEM_MUTATION = `
  mutation DeleteLibraryItem($id: String!) {
    deleteLibraryItem(id: $id) {
      success
      message
      itemId
    }
  }
`

// Legacy UPDATE_READING_PROGRESS_MUTATION removed
// See reading-progress.e2e-spec.ts for sentinel-based progress tests
const UPDATE_READING_PROGRESS_MUTATION = `
  mutation UpdateReadingProgress($id: String!, $progress: ReadingProgressInput!) {
    updateReadingProgress(id: $id, progress: $progress) {
      id
      readAt
    }
  }
`

const MOVE_LIBRARY_ITEM_TO_FOLDER_MUTATION = `
  mutation MoveLibraryItemToFolder($id: String!, $folder: String!) {
    moveLibraryItemToFolder(id: $id, folder: $folder) {
      id
      folder
      state
    }
  }
`

const BULK_ARCHIVE_ITEMS_MUTATION = `
  mutation BulkArchiveItems($itemIds: [String!]!, $archived: Boolean!) {
    bulkArchiveItems(itemIds: $itemIds, archived: $archived) {
      success
      successCount
      failureCount
      errors
      message
    }
  }
`

const BULK_DELETE_ITEMS_MUTATION = `
  mutation BulkDeleteItems($itemIds: [String!]!) {
    bulkDeleteItems(itemIds: $itemIds) {
      success
      successCount
      failureCount
      errors
      message
    }
  }
`

const BULK_MOVE_TO_FOLDER_MUTATION = `
  mutation BulkMoveToFolder($itemIds: [String!]!, $folder: String!) {
    bulkMoveToFolder(itemIds: $itemIds, folder: $folder) {
      success
      successCount
      failureCount
      errors
      message
    }
  }
`

const BULK_MARK_AS_READ_MUTATION = `
  mutation BulkMarkAsRead($itemIds: [String!]!) {
    bulkMarkAsRead(itemIds: $itemIds) {
      success
      successCount
      failureCount
      errors
      message
    }
  }
`

describe('Library GraphQL (e2e)', () => {
  let app: INestApplication
  let authToken: string
  let userId: string
  let libraryRepository: Repository<LibraryItemEntity>

  beforeAll(async () => {
    // Set required environment variables for tests
    process.env.GOOGLE_CLIENT_ID = 'test-client-id'
    process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret'
    process.env.JWT_SECRET = 'test-jwt-secret'

    const { app: testApp, moduleFixture } = await createE2EAppWithModule()
    app = testApp

    libraryRepository = moduleFixture.get<Repository<LibraryItemEntity>>(
      getRepositoryToken(LibraryItemEntity),
    )

    // Tables are auto-created via synchronize:true in test config

    const registerResponse = await request(app.getHttpServer())
      .post('/api/v2/auth/register')
      .send({
        email: `library-test-${Date.now()}@omnivore.app`,
        name: 'Library Test User',
        password: 'libraryPassword123',
      })
      .expect(201)

    authToken = registerResponse.body.accessToken
    userId = registerResponse.body.user.id
  })

  afterAll(async () => {
    await app.close()
  }, 30000) // 30 second timeout for graceful BullMQ worker shutdown

  const executeQuery = (
    query: string,
    variables: Record<string, unknown> = {},
  ) =>
    request(app.getHttpServer())
      .post('/api/graphql')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ query, variables })
      .expect(200)

  it('returns empty collection when user has no items', async () => {
    const response = await executeQuery(LIBRARY_ITEMS_QUERY)

    expect(response.body.errors).toBeUndefined()
    expect(response.body.data.libraryItems.items).toHaveLength(0)
    expect(response.body.data.libraryItems.nextCursor).toBeNull()
  })

  it('returns saved library items with cursor pagination', async () => {
    const firstItem = libraryRepository.create({
      id: randomUUID(),
      userId,
      user: { id: userId } as any,
      title: 'First article',
      slug: 'first-article',
      originalUrl: 'https://example.com/first',
      savedAt: new Date(Date.now() - 2000),
      state: LibraryItemState.SUCCEEDED,
      contentReader: ContentReaderType.WEB,
      folder: FOLDERS.INBOX,
      itemType: 'ARTICLE',
      labelNames: ['news'],
    })

    const secondItem = libraryRepository.create({
      id: randomUUID(),
      userId,
      user: { id: userId } as any,
      title: 'Second article',
      slug: 'second-article',
      originalUrl: 'https://example.com/second',
      savedAt: new Date(),
      state: LibraryItemState.SUCCEEDED,
      contentReader: ContentReaderType.WEB,
      folder: FOLDERS.ARCHIVE,
      itemType: 'ARTICLE',
      labelNames: ['tech'],
    })

    await libraryRepository.save([firstItem, secondItem])

    const firstPage = await executeQuery(LIBRARY_ITEMS_QUERY, { first: 1 })

    expect(firstPage.body.errors).toBeUndefined()
    expect(firstPage.body.data.libraryItems.items).toHaveLength(1)
    expect(firstPage.body.data.libraryItems.items[0]).toMatchObject({
      title: 'Second article',
      slug: 'second-article',
      folder: FOLDERS.ARCHIVE,
      state: 'SUCCEEDED',
    })

    const nextCursor = firstPage.body.data.libraryItems.nextCursor
    expect(nextCursor).toBeTruthy()

    const secondPage = await executeQuery(LIBRARY_ITEMS_QUERY, {
      first: 5,
      after: nextCursor,
    })

    expect(secondPage.body.errors).toBeUndefined()
    expect(secondPage.body.data.libraryItems.items).toHaveLength(1)
    expect(secondPage.body.data.libraryItems.items[0]).toMatchObject({
      title: 'First article',
      slug: 'first-article',
      folder: FOLDERS.INBOX,
      state: 'SUCCEEDED',
    })
    expect(secondPage.body.data.libraryItems.nextCursor).toBeNull()
  })

  it('retrieves a single library item by id', async () => {
    const existing = await libraryRepository.findOneByOrFail({
      slug: 'second-article',
      userId,
    })

    const response = await executeQuery(LIBRARY_ITEM_QUERY, { id: existing.id })

    expect(response.body.errors).toBeUndefined()
    expect(response.body.data.libraryItem).toMatchObject({
      id: existing.id,
      title: 'Second article',
      originalUrl: 'https://example.com/second',
    })
  })

  describe('Mutations', () => {
    let testItemId: string

    beforeEach(async () => {
      // Create a fresh test item for each mutation test
      const timestamp = Date.now()
      const testItem = libraryRepository.create({
        id: randomUUID(),
        userId,
        user: { id: userId } as any,
        title: 'Mutation test article',
        slug: `mutation-test-${timestamp}`,
        originalUrl: `https://example.com/mutation-test-${timestamp}`, // Make URL unique
        savedAt: new Date(),
        state: LibraryItemState.SUCCEEDED,
        contentReader: ContentReaderType.WEB,
        folder: FOLDERS.INBOX,
        itemType: 'ARTICLE',
      })

      const saved = await libraryRepository.save(testItem)
      testItemId = saved.id
    })

    describe('archiveLibraryItem', () => {
      it('archives a library item', async () => {
        const response = await executeQuery(ARCHIVE_LIBRARY_ITEM_MUTATION, {
          id: testItemId,
          archived: true,
        })

        expect(response.body.errors).toBeUndefined()
        expect(response.body.data.archiveLibraryItem).toMatchObject({
          id: testItemId,
          state: 'ARCHIVED',
          folder: FOLDERS.ARCHIVE,
        })

        // Verify in database
        const item = await libraryRepository.findOneBy({ id: testItemId })
        expect(item?.state).toBe(LibraryItemState.ARCHIVED)
        expect(item?.folder).toBe(FOLDERS.ARCHIVE)
      })

      it('unarchives a library item', async () => {
        // First archive it
        await executeQuery(ARCHIVE_LIBRARY_ITEM_MUTATION, {
          id: testItemId,
          archived: true,
        })

        // Then unarchive it
        const response = await executeQuery(ARCHIVE_LIBRARY_ITEM_MUTATION, {
          id: testItemId,
          archived: false,
        })

        expect(response.body.errors).toBeUndefined()
        expect(response.body.data.archiveLibraryItem).toMatchObject({
          id: testItemId,
          state: 'SUCCEEDED',
          folder: FOLDERS.INBOX,
        })

        // Verify in database
        const item = await libraryRepository.findOneBy({ id: testItemId })
        expect(item?.state).toBe(LibraryItemState.SUCCEEDED)
        expect(item?.folder).toBe(FOLDERS.INBOX)
      })

      it('returns error for non-existent item', async () => {
        const response = await executeQuery(ARCHIVE_LIBRARY_ITEM_MUTATION, {
          id: randomUUID(),
          archived: true,
        })

        expect(response.body.errors).toBeDefined()
        expect(response.body.errors[0].message).toContain('not found')
      })
    })

    describe('deleteLibraryItem', () => {
      it('moves item to trash (soft delete)', async () => {
        const response = await executeQuery(DELETE_LIBRARY_ITEM_MUTATION, {
          id: testItemId,
        })

        expect(response.body.errors).toBeUndefined()
        expect(response.body.data.deleteLibraryItem).toMatchObject({
          success: true,
          message: 'Item moved to trash',
          itemId: testItemId,
        })

        // Verify item is in trash
        const item = await libraryRepository.findOneBy({ id: testItemId })
        expect(item?.folder).toBe(FOLDERS.TRASH)
        expect(item?.state).toBe(LibraryItemState.DELETED)
      })

      it('permanently deletes item already in trash', async () => {
        // First move to trash
        await libraryRepository.update(testItemId, {
          folder: FOLDERS.TRASH,
          state: LibraryItemState.DELETED,
        })

        // Then delete permanently
        const response = await executeQuery(DELETE_LIBRARY_ITEM_MUTATION, {
          id: testItemId,
        })

        expect(response.body.errors).toBeUndefined()
        expect(response.body.data.deleteLibraryItem).toMatchObject({
          success: true,
          message: 'Item permanently deleted',
        })

        // Verify item is marked as DELETED
        const item = await libraryRepository.findOneBy({ id: testItemId })
        expect(item?.state).toBe(LibraryItemState.DELETED)
      })

      it('returns error for non-existent item', async () => {
        const response = await executeQuery(DELETE_LIBRARY_ITEM_MUTATION, {
          id: randomUUID(),
        })

        expect(response.body.errors).toBeDefined()
        expect(response.body.errors[0].message).toContain('not found')
      })
    })

    describe('moveLibraryItemToFolder', () => {
      it('moves item to archive', async () => {
        const response = await executeQuery(
          MOVE_LIBRARY_ITEM_TO_FOLDER_MUTATION,
          {
            id: testItemId,
            folder: FOLDERS.ARCHIVE,
          },
        )

        expect(response.body.errors).toBeUndefined()
        expect(response.body.data.moveLibraryItemToFolder).toMatchObject({
          id: testItemId,
          folder: FOLDERS.ARCHIVE,
          state: 'ARCHIVED',
        })

        // Verify in database
        const item = await libraryRepository.findOneBy({ id: testItemId })
        expect(item?.folder).toBe(FOLDERS.ARCHIVE)
        expect(item?.state).toBe(LibraryItemState.ARCHIVED)
      })

      it('moves item to trash', async () => {
        const response = await executeQuery(
          MOVE_LIBRARY_ITEM_TO_FOLDER_MUTATION,
          {
            id: testItemId,
            folder: FOLDERS.TRASH,
          },
        )

        expect(response.body.errors).toBeUndefined()
        expect(response.body.data.moveLibraryItemToFolder).toMatchObject({
          id: testItemId,
          folder: FOLDERS.TRASH,
          state: 'DELETED',
        })
      })

      it('moves item back to inbox', async () => {
        // First move to archive
        await libraryRepository.update(testItemId, {
          folder: FOLDERS.ARCHIVE,
          state: LibraryItemState.ARCHIVED,
        })

        // Then move back to inbox
        const response = await executeQuery(
          MOVE_LIBRARY_ITEM_TO_FOLDER_MUTATION,
          {
            id: testItemId,
            folder: FOLDERS.INBOX,
          },
        )

        expect(response.body.errors).toBeUndefined()
        expect(response.body.data.moveLibraryItemToFolder).toMatchObject({
          id: testItemId,
          folder: FOLDERS.INBOX,
          state: 'SUCCEEDED',
        })
      })

      it('returns error for invalid folder', async () => {
        const response = await executeQuery(
          MOVE_LIBRARY_ITEM_TO_FOLDER_MUTATION,
          {
            id: testItemId,
            folder: 'invalid-folder',
          },
        )

        expect(response.body.errors).toBeDefined()
        expect(response.body.errors[0].message).toContain('Invalid folder')
      })

      it('returns error for non-existent item', async () => {
        const response = await executeQuery(
          MOVE_LIBRARY_ITEM_TO_FOLDER_MUTATION,
          {
            id: randomUUID(),
            folder: FOLDERS.ARCHIVE,
          },
        )

        expect(response.body.errors).toBeDefined()
        expect(response.body.errors[0].message).toContain('not found')
      })
    })
  })

  describe('Search and Filtering', () => {
    beforeAll(async () => {
      // Create diverse test items for search testing
      const searchTestItems = [
        {
          id: randomUUID(),
          userId,
          user: { id: userId } as any,
          title: 'Building Scalable NestJS Applications',
          slug: 'nestjs-scalability',
          originalUrl: 'https://example.com/nestjs',
          author: 'John Doe',
          description: 'Learn how to build scalable applications',
          savedAt: new Date(Date.now() - 5000),
          state: LibraryItemState.SUCCEEDED,
          contentReader: ContentReaderType.WEB,
          folder: FOLDERS.INBOX,
          itemType: 'ARTICLE',
        },
        {
          id: randomUUID(),
          userId,
          user: { id: userId } as any,
          title: 'GraphQL Best Practices',
          slug: 'graphql-practices',
          originalUrl: 'https://example.com/graphql',
          author: 'Jane Smith',
          description: 'Modern GraphQL API design patterns',
          savedAt: new Date(Date.now() - 4000),
          state: LibraryItemState.SUCCEEDED,
          contentReader: ContentReaderType.WEB,
          folder: FOLDERS.INBOX,
          itemType: 'ARTICLE',
        },
        {
          id: randomUUID(),
          userId,
          user: { id: userId } as any,
          title: 'PostgreSQL Performance Tuning',
          slug: 'postgres-performance',
          originalUrl: 'https://example.com/postgres',
          author: 'John Doe',
          description: 'Optimize your database queries',
          savedAt: new Date(Date.now() - 3000),
          state: LibraryItemState.ARCHIVED,
          contentReader: ContentReaderType.WEB,
          folder: FOLDERS.ARCHIVE,
          itemType: 'ARTICLE',
        },
        {
          id: randomUUID(),
          userId,
          user: { id: userId } as any,
          title: 'TypeScript Advanced Types',
          slug: 'typescript-types',
          originalUrl: 'https://example.com/typescript',
          author: 'Bob Johnson',
          description: 'Deep dive into TypeScript type system',
          savedAt: new Date(Date.now() - 2000),
          state: LibraryItemState.SUCCEEDED,
          contentReader: ContentReaderType.WEB,
          folder: FOLDERS.INBOX,
          itemType: 'ARTICLE',
        },
      ]

      await libraryRepository.save(searchTestItems)
    })

    it('searches by query in title', async () => {
      const response = await executeQuery(LIBRARY_ITEMS_QUERY, {
        search: { query: 'NestJS' },
      })

      expect(response.body.errors).toBeUndefined()
      expect(response.body.data.libraryItems.items).toHaveLength(1)
      expect(response.body.data.libraryItems.items[0].title).toContain('NestJS')
    })

    it('searches by query in description', async () => {
      const response = await executeQuery(LIBRARY_ITEMS_QUERY, {
        search: { query: 'GraphQL' },
      })

      expect(response.body.errors).toBeUndefined()
      const titles = response.body.data.libraryItems.items.map(
        (item: any) => item.title,
      )
      expect(titles).toContain('GraphQL Best Practices')
    })

    it('searches by query in author', async () => {
      const response = await executeQuery(LIBRARY_ITEMS_QUERY, {
        search: { query: 'John Doe' },
      })

      expect(response.body.errors).toBeUndefined()
      expect(
        response.body.data.libraryItems.items.length,
      ).toBeGreaterThanOrEqual(2)
      expect(
        response.body.data.libraryItems.items.every(
          (item: any) => item.author === 'John Doe',
        ),
      ).toBe(true)
    })

    it('filters by folder (inbox)', async () => {
      const response = await executeQuery(LIBRARY_ITEMS_QUERY, {
        search: { folder: FOLDERS.INBOX },
      })

      expect(response.body.errors).toBeUndefined()
      expect(response.body.data.libraryItems.items.length).toBeGreaterThan(0)
      expect(
        response.body.data.libraryItems.items.every(
          (item: any) => item.folder === FOLDERS.INBOX,
        ),
      ).toBe(true)
    })

    it('filters by folder (archive)', async () => {
      const response = await executeQuery(LIBRARY_ITEMS_QUERY, {
        search: { folder: FOLDERS.ARCHIVE },
      })

      expect(response.body.errors).toBeUndefined()
      expect(response.body.data.libraryItems.items.length).toBeGreaterThan(0)
      expect(
        response.body.data.libraryItems.items.every(
          (item: any) => item.folder === FOLDERS.ARCHIVE,
        ),
      ).toBe(true)
    })

    it('filters by state', async () => {
      const response = await executeQuery(LIBRARY_ITEMS_QUERY, {
        search: { state: 'ARCHIVED' },
      })

      expect(response.body.errors).toBeUndefined()
      expect(response.body.data.libraryItems.items.length).toBeGreaterThan(0)
      expect(
        response.body.data.libraryItems.items.every(
          (item: any) => item.state === 'ARCHIVED',
        ),
      ).toBe(true)
    })

    it('combines search query with folder filter', async () => {
      const response = await executeQuery(LIBRARY_ITEMS_QUERY, {
        search: { query: 'John Doe', folder: FOLDERS.INBOX },
      })

      expect(response.body.errors).toBeUndefined()
      const items = response.body.data.libraryItems.items
      expect(items.every((item: any) => item.folder === FOLDERS.INBOX)).toBe(
        true,
      )
      expect(items.every((item: any) => item.author === 'John Doe')).toBe(true)
    })

    it('sorts by title ascending', async () => {
      const response = await executeQuery(LIBRARY_ITEMS_QUERY, {
        first: 10,
        search: { sortBy: 'TITLE', sortOrder: 'ASC' },
      })

      expect(response.body.errors).toBeUndefined()
      const titles = response.body.data.libraryItems.items.map(
        (item: any) => item.title,
      )
      const sortedTitles = [...titles].sort()
      expect(titles).toEqual(sortedTitles)
    })

    it('sorts by savedAt descending (default)', async () => {
      const response = await executeQuery(LIBRARY_ITEMS_QUERY, {
        first: 10,
        search: { sortBy: 'SAVED_AT', sortOrder: 'DESC' },
      })

      expect(response.body.errors).toBeUndefined()
      expect(response.body.data.libraryItems.items.length).toBeGreaterThan(0)
      // Most recent should be first
    })

    it('returns empty results for non-matching search', async () => {
      const response = await executeQuery(LIBRARY_ITEMS_QUERY, {
        search: { query: 'nonexistentquery12345' },
      })

      expect(response.body.errors).toBeUndefined()
      expect(response.body.data.libraryItems.items).toHaveLength(0)
    })

    it('handles case-insensitive search', async () => {
      const response = await executeQuery(LIBRARY_ITEMS_QUERY, {
        search: { query: 'graphql' }, // lowercase
      })

      expect(response.body.errors).toBeUndefined()
      expect(response.body.data.libraryItems.items.length).toBeGreaterThan(0)
      expect(response.body.data.libraryItems.items[0].title).toContain(
        'GraphQL',
      )
    })

    it('supports pagination with search filters', async () => {
      const firstPage = await executeQuery(LIBRARY_ITEMS_QUERY, {
        first: 2,
        search: { folder: FOLDERS.INBOX },
      })

      expect(firstPage.body.errors).toBeUndefined()
      expect(firstPage.body.data.libraryItems.items.length).toBeLessThanOrEqual(
        2,
      )

      const nextCursor = firstPage.body.data.libraryItems.nextCursor
      if (nextCursor) {
        const secondPage = await executeQuery(LIBRARY_ITEMS_QUERY, {
          first: 2,
          after: nextCursor,
          search: { folder: FOLDERS.INBOX },
        })

        expect(secondPage.body.errors).toBeUndefined()
        // All items should still be from inbox
        expect(
          secondPage.body.data.libraryItems.items.every(
            (item: any) => item.folder === FOLDERS.INBOX,
          ),
        ).toBe(true)
      }
    })
  })

  describe('Bulk Operations', () => {
    let bulkTestItemIds: string[]

    beforeEach(async () => {
      // Create multiple test items for bulk operations
      const timestamp = Date.now()
      const bulkTestItems = Array.from({ length: 5 }, (_, i) => ({
        id: randomUUID(),
        userId,
        user: { id: userId } as any,
        title: `Bulk Test Item ${i + 1}`,
        slug: `bulk-test-${timestamp}-${i + 1}`,
        originalUrl: `https://example.com/bulk-${timestamp}-${i + 1}`, // Make URL unique
        savedAt: new Date(Date.now() - (i + 1) * 1000),
        state: LibraryItemState.SUCCEEDED,
        contentReader: ContentReaderType.WEB,
        folder: FOLDERS.INBOX,
        itemType: 'ARTICLE',
      }))

      const savedItems = await libraryRepository.save(bulkTestItems)
      bulkTestItemIds = savedItems.map((item) => item.id)
    })

    describe('bulkArchiveItems', () => {
      it('archives multiple items successfully', async () => {
        const response = await executeQuery(BULK_ARCHIVE_ITEMS_MUTATION, {
          itemIds: bulkTestItemIds.slice(0, 3),
          archived: true,
        })

        expect(response.body.errors).toBeUndefined()
        expect(response.body.data.bulkArchiveItems).toMatchObject({
          success: true,
          successCount: 3,
          failureCount: 0,
        })
        expect(response.body.data.bulkArchiveItems.message).toContain(
          'archived',
        )

        // Verify items are archived
        const archivedItems = await libraryRepository.find({
          where: { id: bulkTestItemIds[0] },
        })
        expect(archivedItems[0].state).toBe(LibraryItemState.ARCHIVED)
        expect(archivedItems[0].folder).toBe('archive')
      })

      it('unarchives multiple items successfully', async () => {
        // First archive some items
        await libraryRepository.update(
          { id: bulkTestItemIds[0] },
          { state: LibraryItemState.ARCHIVED, folder: 'archive' },
        )

        const response = await executeQuery(BULK_ARCHIVE_ITEMS_MUTATION, {
          itemIds: [bulkTestItemIds[0]],
          archived: false,
        })

        expect(response.body.errors).toBeUndefined()
        expect(response.body.data.bulkArchiveItems).toMatchObject({
          success: true,
          successCount: 1,
          failureCount: 0,
        })

        // Verify item is unarchived
        const item = await libraryRepository.findOne({
          where: { id: bulkTestItemIds[0] },
        })
        expect(item?.state).toBe(LibraryItemState.SUCCEEDED)
        expect(item?.folder).toBe(FOLDERS.INBOX)
      })

      it('returns error for empty itemIds array', async () => {
        const response = await executeQuery(BULK_ARCHIVE_ITEMS_MUTATION, {
          itemIds: [],
          archived: true,
        })

        expect(response.body.errors).toBeDefined()
        expect(response.body.errors[0].message).toContain(
          'No item IDs provided',
        )
      })

      it('handles partial success gracefully', async () => {
        const mixedIds = [...bulkTestItemIds.slice(0, 2), randomUUID()]

        const response = await executeQuery(BULK_ARCHIVE_ITEMS_MUTATION, {
          itemIds: mixedIds,
          archived: true,
        })

        expect(response.body.errors).toBeUndefined()
        expect(
          response.body.data.bulkArchiveItems.successCount,
        ).toBeGreaterThan(0)
      })
    })

    describe('bulkDeleteItems', () => {
      it('deletes multiple items successfully', async () => {
        const idsToDelete = bulkTestItemIds.slice(0, 3)

        const response = await executeQuery(BULK_DELETE_ITEMS_MUTATION, {
          itemIds: idsToDelete,
        })

        expect(response.body.errors).toBeUndefined()
        expect(response.body.data.bulkDeleteItems).toMatchObject({
          success: true,
          successCount: 3,
          failureCount: 0,
        })

        // Verify items are deleted (marked as DELETED and moved to trash)
        const deletedItem = await libraryRepository.findOne({
          where: { id: idsToDelete[0] },
        })
        expect(deletedItem?.state).toBe(LibraryItemState.DELETED)
        expect(deletedItem?.folder).toBe('trash')
      })

      it('returns error for empty itemIds array', async () => {
        const response = await executeQuery(BULK_DELETE_ITEMS_MUTATION, {
          itemIds: [],
        })

        expect(response.body.errors).toBeDefined()
        expect(response.body.errors[0].message).toContain(
          'No item IDs provided',
        )
      })
    })

    describe('bulkMoveToFolder', () => {
      it('moves multiple items to archive folder', async () => {
        const idsToMove = bulkTestItemIds.slice(0, 3)

        const response = await executeQuery(BULK_MOVE_TO_FOLDER_MUTATION, {
          itemIds: idsToMove,
          folder: FOLDERS.ARCHIVE,
        })

        expect(response.body.errors).toBeUndefined()
        expect(response.body.data.bulkMoveToFolder).toMatchObject({
          success: true,
          successCount: 3,
          failureCount: 0,
        })

        // Verify items are moved
        const movedItem = await libraryRepository.findOne({
          where: { id: idsToMove[0] },
        })
        expect(movedItem?.folder).toBe('archive')
        expect(movedItem?.state).toBe(LibraryItemState.ARCHIVED)
      })

      it('moves multiple items to trash folder', async () => {
        const idsToMove = bulkTestItemIds.slice(0, 2)

        const response = await executeQuery(BULK_MOVE_TO_FOLDER_MUTATION, {
          itemIds: idsToMove,
          folder: FOLDERS.TRASH,
        })

        expect(response.body.errors).toBeUndefined()
        expect(response.body.data.bulkMoveToFolder).toMatchObject({
          success: true,
          successCount: 2,
          failureCount: 0,
        })

        // Verify items are moved
        const movedItem = await libraryRepository.findOne({
          where: { id: idsToMove[0] },
        })
        expect(movedItem?.folder).toBe('trash')
        expect(movedItem?.state).toBe(LibraryItemState.DELETED)
      })

      it('returns error for invalid folder', async () => {
        const response = await executeQuery(BULK_MOVE_TO_FOLDER_MUTATION, {
          itemIds: [bulkTestItemIds[0]],
          folder: 'invalid-folder',
        })

        expect(response.body.errors).toBeDefined()
        expect(response.body.errors[0].message).toContain('Invalid folder')
      })

      it('returns error for empty itemIds array', async () => {
        const response = await executeQuery(BULK_MOVE_TO_FOLDER_MUTATION, {
          itemIds: [],
          folder: FOLDERS.ARCHIVE,
        })

        expect(response.body.errors).toBeDefined()
        expect(response.body.errors[0].message).toContain(
          'No item IDs provided',
        )
      })
    })

    describe('bulkMarkAsRead', () => {
      it('marks multiple items as read successfully', async () => {
        const idsToMark = bulkTestItemIds.slice(0, 3)

        const response = await executeQuery(BULK_MARK_AS_READ_MUTATION, {
          itemIds: idsToMark,
        })

        expect(response.body.errors).toBeUndefined()
        expect(response.body.data.bulkMarkAsRead).toMatchObject({
          success: true,
          successCount: 3,
          failureCount: 0,
        })

        // Verify items are marked as read
        const markedItem = await libraryRepository.findOne({
          where: { id: idsToMark[0] },
        })
        expect(markedItem?.readAt).toBeDefined()
        expect(markedItem?.readAt).toBeInstanceOf(Date)
      })

      it('returns error for empty itemIds array', async () => {
        const response = await executeQuery(BULK_MARK_AS_READ_MUTATION, {
          itemIds: [],
        })

        expect(response.body.errors).toBeDefined()
        expect(response.body.errors[0].message).toContain(
          'No item IDs provided',
        )
      })
    })

    describe('Bulk operations with large datasets', () => {
      it('handles bulk operations with 100 items efficiently', async () => {
        // Create 100 test items
        const timestamp = Date.now()
        const largeDataset = Array.from({ length: 100 }, (_, i) => ({
          id: randomUUID(),
          userId,
          user: { id: userId } as any,
          title: `Large Dataset Item ${i + 1}`,
          slug: `large-dataset-${timestamp}-${i + 1}`,
          originalUrl: `https://example.com/large-${timestamp}-${i + 1}`, // Make URL unique
          savedAt: new Date(),
          state: LibraryItemState.SUCCEEDED,
          contentReader: ContentReaderType.WEB,
          folder: FOLDERS.INBOX,
          itemType: 'ARTICLE',
        }))

        const savedItems = await libraryRepository.save(largeDataset)
        const largeItemIds = savedItems.map((item) => item.id)

        const response = await executeQuery(BULK_ARCHIVE_ITEMS_MUTATION, {
          itemIds: largeItemIds,
          archived: true,
        })

        expect(response.body.errors).toBeUndefined()
        expect(response.body.data.bulkArchiveItems).toMatchObject({
          success: true,
          successCount: 100,
          failureCount: 0,
        })

        // Clean up
        await libraryRepository.delete({ id: largeItemIds[0] })
      })

      it('enforces bulk operation limit of 1000 items', async () => {
        const tooManyIds = Array.from({ length: 1001 }, () => randomUUID())

        const response = await executeQuery(BULK_ARCHIVE_ITEMS_MUTATION, {
          itemIds: tooManyIds,
          archived: true,
        })

        expect(response.body.errors).toBeDefined()
        expect(response.body.errors[0].message).toContain('limited to 1000')
      })
    })
  })
})
