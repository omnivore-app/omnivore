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
import { ReadingProgressEntity } from '../src/reading-progress/entities/reading-progress.entity'
import { FOLDERS } from '../src/constants/folders.constants'

const GET_READING_PROGRESS_QUERY = `
  query GetReadingProgress($libraryItemId: String!, $contentVersion: String) {
    readingProgress(libraryItemId: $libraryItemId, contentVersion: $contentVersion) {
      id
      libraryItemId
      contentVersion
      lastSeenSentinel
      highestSeenSentinel
      createdAt
      updatedAt
    }
  }
`

const UPDATE_READING_PROGRESS_MUTATION = `
  mutation UpdateReadingProgress($input: UpdateReadingProgressInput!) {
    updateReadingProgress(input: $input) {
      id
      libraryItemId
      contentVersion
      lastSeenSentinel
      highestSeenSentinel
      createdAt
      updatedAt
    }
  }
`

describe('ReadingProgress GraphQL (e2e)', () => {
  let app: INestApplication
  let authToken: string
  let userId: string
  let libraryRepository: Repository<LibraryItemEntity>
  let progressRepository: Repository<ReadingProgressEntity>
  let testItemId: string
  let testContentVersion: string

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
    progressRepository = moduleFixture.get<Repository<ReadingProgressEntity>>(
      getRepositoryToken(ReadingProgressEntity),
    )
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    // Note: Don't clear tables here due to foreign key constraints
    // Each test creates a unique user, so data is isolated

    // Create a test user and get auth token via REST endpoint
    const registerResponse = await request(app.getHttpServer())
      .post('/api/v2/auth/register')
      .send({
        email: `reading-progress-test-${Date.now()}@omnivore.app`,
        name: 'Reading Progress Test User',
        password: 'testPassword123',
      })
      .expect(201)

    authToken = registerResponse.body.accessToken
    userId = registerResponse.body.user.id
  })

  const executeQuery = async (query: string, variables?: any) => {
    return request(app.getHttpServer())
      .post('/api/graphql')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ query, variables })
  }

  describe('Sentinel-based Reading Progress', () => {
    beforeEach(async () => {
      // Create a test library item
      testContentVersion = 'test-hash-' + randomUUID()
      const testItem = libraryRepository.create({
        id: randomUUID(),
        userId,
        user: { id: userId } as any,
        title: 'Test Article for Reading Progress',
        slug: 'test-article-reading-progress',
        originalUrl: 'https://example.com/test-article',
        author: 'Test Author',
        description: 'Test description',
        savedAt: new Date(),
        state: LibraryItemState.SUCCEEDED,
        contentReader: ContentReaderType.WEB,
        folder: FOLDERS.INBOX,
        itemType: 'ARTICLE',
        contentHash: testContentVersion,
      })

      const saved = await libraryRepository.save(testItem)
      testItemId = saved.id
    })

    describe('updateReadingProgress', () => {
      it('creates new reading progress record', async () => {
        const response = await executeQuery(UPDATE_READING_PROGRESS_MUTATION, {
          input: {
            libraryItemId: testItemId,
            contentVersion: testContentVersion,
            lastSeenSentinel: 25,
            highestSeenSentinel: 30,
          },
        })

        expect(response.body.errors).toBeUndefined()
        expect(response.body.data.updateReadingProgress).toMatchObject({
          libraryItemId: testItemId,
          contentVersion: testContentVersion,
          lastSeenSentinel: 25,
          highestSeenSentinel: 30,
        })
        expect(response.body.data.updateReadingProgress.id).toBeTruthy()

        // Verify in database
        const progress = await progressRepository.findOne({
          where: {
            libraryItemId: testItemId,
            userId,
            contentVersion: testContentVersion,
          },
        })
        expect(progress).toBeTruthy()
        expect(progress?.lastSeenSentinel).toBe(25)
        expect(progress?.highestSeenSentinel).toBe(30)
      })

      it('updates existing reading progress record', async () => {
        // Create initial progress
        await executeQuery(UPDATE_READING_PROGRESS_MUTATION, {
          input: {
            libraryItemId: testItemId,
            contentVersion: testContentVersion,
            lastSeenSentinel: 10,
            highestSeenSentinel: 15,
          },
        })

        // Update progress (user scrolled further)
        const response = await executeQuery(UPDATE_READING_PROGRESS_MUTATION, {
          input: {
            libraryItemId: testItemId,
            contentVersion: testContentVersion,
            lastSeenSentinel: 25,
            highestSeenSentinel: 30,
          },
        })

        expect(response.body.errors).toBeUndefined()
        expect(response.body.data.updateReadingProgress).toMatchObject({
          libraryItemId: testItemId,
          lastSeenSentinel: 25,
          highestSeenSentinel: 30,
        })

        // Verify only one record exists in database
        const progressRecords = await progressRepository.find({
          where: {
            libraryItemId: testItemId,
            userId,
          },
        })
        expect(progressRecords).toHaveLength(1)
      })

      it('tracks highest sentinel correctly when user scrolls backwards', async () => {
        // User scrolls to sentinel 50
        await executeQuery(UPDATE_READING_PROGRESS_MUTATION, {
          input: {
            libraryItemId: testItemId,
            contentVersion: testContentVersion,
            lastSeenSentinel: 50,
            highestSeenSentinel: 50,
          },
        })

        // User scrolls back to sentinel 20 (but highest should remain 50)
        const response = await executeQuery(UPDATE_READING_PROGRESS_MUTATION, {
          input: {
            libraryItemId: testItemId,
            contentVersion: testContentVersion,
            lastSeenSentinel: 20,
            highestSeenSentinel: 50, // Frontend should send the max
          },
        })

        expect(response.body.errors).toBeUndefined()
        expect(response.body.data.updateReadingProgress).toMatchObject({
          lastSeenSentinel: 20, // Current position
          highestSeenSentinel: 50, // Max ever reached
        })
      })

      it('handles multiple content versions for the same item', async () => {
        const contentV1 = 'version-1-hash'
        const contentV2 = 'version-2-hash'

        // Save progress for version 1
        await executeQuery(UPDATE_READING_PROGRESS_MUTATION, {
          input: {
            libraryItemId: testItemId,
            contentVersion: contentV1,
            lastSeenSentinel: 25,
            highestSeenSentinel: 30,
          },
        })

        // Save progress for version 2 (content changed)
        await executeQuery(UPDATE_READING_PROGRESS_MUTATION, {
          input: {
            libraryItemId: testItemId,
            contentVersion: contentV2,
            lastSeenSentinel: 10,
            highestSeenSentinel: 15,
          },
        })

        // Verify both records exist
        const v1Progress = await progressRepository.findOne({
          where: {
            libraryItemId: testItemId,
            userId,
            contentVersion: contentV1,
          },
        })
        const v2Progress = await progressRepository.findOne({
          where: {
            libraryItemId: testItemId,
            userId,
            contentVersion: contentV2,
          },
        })

        expect(v1Progress).toBeTruthy()
        expect(v1Progress?.lastSeenSentinel).toBe(25)
        expect(v2Progress).toBeTruthy()
        expect(v2Progress?.lastSeenSentinel).toBe(10)
      })

      it('accepts progress without content version (null)', async () => {
        const response = await executeQuery(UPDATE_READING_PROGRESS_MUTATION, {
          input: {
            libraryItemId: testItemId,
            lastSeenSentinel: 15,
            highestSeenSentinel: 20,
          },
        })

        expect(response.body.errors).toBeUndefined()
        expect(
          response.body.data.updateReadingProgress.contentVersion,
        ).toBeNull()
      })

      it('returns error for negative sentinel values', async () => {
        const response = await executeQuery(UPDATE_READING_PROGRESS_MUTATION, {
          input: {
            libraryItemId: testItemId,
            contentVersion: testContentVersion,
            lastSeenSentinel: -5,
            highestSeenSentinel: 10,
          },
        })

        expect(response.body.errors).toBeDefined()
      })

      it('returns error for non-existent library item', async () => {
        const response = await executeQuery(UPDATE_READING_PROGRESS_MUTATION, {
          input: {
            libraryItemId: randomUUID(),
            contentVersion: testContentVersion,
            lastSeenSentinel: 10,
            highestSeenSentinel: 15,
          },
        })

        expect(response.body.errors).toBeDefined()
        expect(response.body.errors[0].message).toContain('not found')
      })
    })

    describe('readingProgress query', () => {
      beforeEach(async () => {
        // Create some test progress data
        await progressRepository.save(
          progressRepository.create({
            id: randomUUID(),
            userId,
            libraryItemId: testItemId,
            contentVersion: testContentVersion,
            lastSeenSentinel: 42,
            highestSeenSentinel: 55,
          }),
        )
      })

      it('retrieves reading progress by library item ID and content version', async () => {
        const response = await executeQuery(GET_READING_PROGRESS_QUERY, {
          libraryItemId: testItemId,
          contentVersion: testContentVersion,
        })

        expect(response.body.errors).toBeUndefined()
        expect(response.body.data.readingProgress).toMatchObject({
          libraryItemId: testItemId,
          contentVersion: testContentVersion,
          lastSeenSentinel: 42,
          highestSeenSentinel: 55,
        })
      })

      it('retrieves latest progress when content version not provided', async () => {
        // Create progress for multiple versions
        await progressRepository.save(
          progressRepository.create({
            id: randomUUID(),
            userId,
            libraryItemId: testItemId,
            contentVersion: 'older-version',
            lastSeenSentinel: 10,
            highestSeenSentinel: 20,
            updatedAt: new Date(Date.now() - 10000), // 10 seconds ago
          }),
        )

        const response = await executeQuery(GET_READING_PROGRESS_QUERY, {
          libraryItemId: testItemId,
        })

        expect(response.body.errors).toBeUndefined()
        // Should return the more recent one (testContentVersion)
        expect(response.body.data.readingProgress.contentVersion).toBe(
          testContentVersion,
        )
      })

      it('returns null for non-existent progress', async () => {
        const response = await executeQuery(GET_READING_PROGRESS_QUERY, {
          libraryItemId: randomUUID(),
          contentVersion: 'non-existent',
        })

        expect(response.body.errors).toBeDefined()
        // Should get error because library item doesn't exist
      })

      it('returns null when no progress exists for given version', async () => {
        const response = await executeQuery(GET_READING_PROGRESS_QUERY, {
          libraryItemId: testItemId,
          contentVersion: 'different-version',
        })

        expect(response.body.errors).toBeUndefined()
        expect(response.body.data.readingProgress).toBeNull()
      })
    })

    describe('End-to-end reading flow', () => {
      it('simulates complete reading session with position restoration', async () => {
        // Step 1: User starts reading (sentinel 0)
        await executeQuery(UPDATE_READING_PROGRESS_MUTATION, {
          input: {
            libraryItemId: testItemId,
            contentVersion: testContentVersion,
            lastSeenSentinel: 0,
            highestSeenSentinel: 0,
          },
        })

        // Step 2: User scrolls to middle of article (sentinel 25)
        await executeQuery(UPDATE_READING_PROGRESS_MUTATION, {
          input: {
            libraryItemId: testItemId,
            contentVersion: testContentVersion,
            lastSeenSentinel: 25,
            highestSeenSentinel: 25,
          },
        })

        // Step 3: User leaves and comes back - fetch progress
        const getProgressResponse = await executeQuery(
          GET_READING_PROGRESS_QUERY,
          {
            libraryItemId: testItemId,
            contentVersion: testContentVersion,
          },
        )

        expect(
          getProgressResponse.body.data.readingProgress.lastSeenSentinel,
        ).toBe(25)

        // Step 4: User continues reading to end (sentinel 50)
        await executeQuery(UPDATE_READING_PROGRESS_MUTATION, {
          input: {
            libraryItemId: testItemId,
            contentVersion: testContentVersion,
            lastSeenSentinel: 50,
            highestSeenSentinel: 50,
          },
        })

        // Step 5: Verify final progress
        const finalProgressResponse = await executeQuery(
          GET_READING_PROGRESS_QUERY,
          {
            libraryItemId: testItemId,
            contentVersion: testContentVersion,
          },
        )

        expect(
          finalProgressResponse.body.data.readingProgress.highestSeenSentinel,
        ).toBe(50)
      })
    })
  })
})
