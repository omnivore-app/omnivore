import { randomUUID } from 'crypto'
import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm'
import request from 'supertest'
import { Repository } from 'typeorm'
import { AppModule } from '../src/app/app.module'
import { testDatabaseConfig } from '../src/config/test.config'
import {
  ContentReaderType,
  LibraryItemEntity,
  LibraryItemState,
} from '../src/library/entities/library-item.entity'

const LIBRARY_ITEM_QUERY = `
  query LibraryItem($id: String!) {
    libraryItem(id: $id) {
      id
      title
      note
      noteUpdatedAt
    }
  }
`

const UPDATE_NOTEBOOK_MUTATION = `
  mutation UpdateNotebook($id: String!, $input: UpdateNotebookInput!) {
    updateNotebook(id: $id, input: $input) {
      id
      note
      noteUpdatedAt
    }
  }
`

describe('Notebook GraphQL (e2e)', () => {
  let app: INestApplication
  let authToken: string
  let userId: string
  let libraryRepository: Repository<LibraryItemEntity>

  beforeAll(async () => {
    // Set required environment variables for tests
    process.env.GOOGLE_CLIENT_ID = 'test-client-id'
    process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret'
    process.env.JWT_SECRET = 'test-jwt-secret'

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideModule(TypeOrmModule)
      .useModule(TypeOrmModule.forRoot(testDatabaseConfig))
      .compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    )

    app.setGlobalPrefix('api/v2')
    await app.init()

    libraryRepository = moduleFixture.get<Repository<LibraryItemEntity>>(
      getRepositoryToken(LibraryItemEntity),
    )

    const registerResponse = await request(app.getHttpServer())
      .post('/api/v2/auth/register')
      .send({
        email: `notebook-test-${Date.now()}@omnivore.app`,
        name: 'Notebook Test User',
        password: 'notebookPassword123',
      })
      .expect(201)

    authToken = registerResponse.body.accessToken
    userId = registerResponse.body.user.id
  })

  afterAll(async () => {
    await app.close()
  }, 30000)

  const executeQuery = (query: string, variables: Record<string, unknown> = {}) =>
    request(app.getHttpServer())
      .post('/api/graphql')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ query, variables })
      .expect(200)

  describe('updateNotebook', () => {
    let testItemId: string

    beforeEach(async () => {
      const timestamp = Date.now()
      const testItem = libraryRepository.create({
        id: randomUUID(),
        userId,
        user: { id: userId } as any,
        title: 'Test Article with Notebook',
        slug: `notebook-test-${timestamp}`,
        originalUrl: `https://example.com/notebook-test-${timestamp}`,
        savedAt: new Date(),
        state: LibraryItemState.SUCCEEDED,
        contentReader: ContentReaderType.WEB,
        folder: 'inbox',
        itemType: 'ARTICLE',
      })

      const saved = await libraryRepository.save(testItem)
      testItemId = saved.id
    })

    it('creates a new notebook for a library item', async () => {
      const noteContent = '# My Thoughts\n\nThis is an interesting article about TypeScript.'

      const response = await executeQuery(UPDATE_NOTEBOOK_MUTATION, {
        id: testItemId,
        input: { note: noteContent },
      })

      expect(response.body.errors).toBeUndefined()
      expect(response.body.data.updateNotebook).toMatchObject({
        id: testItemId,
        note: noteContent,
      })
      expect(response.body.data.updateNotebook.noteUpdatedAt).toBeTruthy()

      // Verify in database
      const item = await libraryRepository.findOneBy({ id: testItemId })
      expect(item?.note).toBe(noteContent)
      expect(item?.noteUpdatedAt).toBeInstanceOf(Date)
    })

    it('updates an existing notebook', async () => {
      const initialNote = 'Initial thoughts'
      await libraryRepository.update(testItemId, { note: initialNote })

      const updatedNote = 'Updated thoughts with more details'
      const response = await executeQuery(UPDATE_NOTEBOOK_MUTATION, {
        id: testItemId,
        input: { note: updatedNote },
      })

      expect(response.body.errors).toBeUndefined()
      expect(response.body.data.updateNotebook).toMatchObject({
        id: testItemId,
        note: updatedNote,
      })

      // Verify in database
      const item = await libraryRepository.findOneBy({ id: testItemId })
      expect(item?.note).toBe(updatedNote)
      expect(item?.noteUpdatedAt).toBeInstanceOf(Date)
    })

    it('clears a notebook with empty string', async () => {
      await libraryRepository.update(testItemId, { note: 'Some notes' })

      const response = await executeQuery(UPDATE_NOTEBOOK_MUTATION, {
        id: testItemId,
        input: { note: '' },
      })

      expect(response.body.errors).toBeUndefined()
      expect(response.body.data.updateNotebook.note).toBe('')

      // Verify in database
      const item = await libraryRepository.findOneBy({ id: testItemId })
      expect(item?.note).toBe('')
    })

    it('supports markdown formatting in notebooks', async () => {
      const markdownNote = `# Summary

## Key Points
- **Important**: TypeScript provides type safety
- *Interesting*: Works well with React
- \`code example\`: const x: number = 5

### Links
[Official Docs](https://typescriptlang.org)`

      const response = await executeQuery(UPDATE_NOTEBOOK_MUTATION, {
        id: testItemId,
        input: { note: markdownNote },
      })

      expect(response.body.errors).toBeUndefined()
      expect(response.body.data.updateNotebook.note).toBe(markdownNote)

      // Verify in database
      const item = await libraryRepository.findOneBy({ id: testItemId })
      expect(item?.note).toBe(markdownNote)
    })

    it('handles long notebook content', async () => {
      const longNote = 'A'.repeat(10000) // 10KB of text

      const response = await executeQuery(UPDATE_NOTEBOOK_MUTATION, {
        id: testItemId,
        input: { note: longNote },
      })

      expect(response.body.errors).toBeUndefined()
      expect(response.body.data.updateNotebook.note).toBe(longNote)

      // Verify in database
      const item = await libraryRepository.findOneBy({ id: testItemId })
      expect(item?.note).toBe(longNote)
    })

    it('returns error for non-existent library item', async () => {
      const response = await executeQuery(UPDATE_NOTEBOOK_MUTATION, {
        id: randomUUID(),
        input: { note: 'Test note' },
      })

      expect(response.body.errors).toBeDefined()
      expect(response.body.errors[0].message).toContain('not found')
    })

    it('retrieves notebook via libraryItem query', async () => {
      const noteContent = 'My personal notes about this article'
      await libraryRepository.update(testItemId, { note: noteContent })

      const response = await executeQuery(LIBRARY_ITEM_QUERY, {
        id: testItemId,
      })

      expect(response.body.errors).toBeUndefined()
      expect(response.body.data.libraryItem).toMatchObject({
        id: testItemId,
        note: noteContent,
      })
      expect(response.body.data.libraryItem.noteUpdatedAt).toBeTruthy()
    })

    it('updates noteUpdatedAt timestamp on each update', async () => {
      // First update
      const firstResponse = await executeQuery(UPDATE_NOTEBOOK_MUTATION, {
        id: testItemId,
        input: { note: 'First version' },
      })

      const firstTimestamp = new Date(
        firstResponse.body.data.updateNotebook.noteUpdatedAt,
      )

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10))

      // Second update
      const secondResponse = await executeQuery(UPDATE_NOTEBOOK_MUTATION, {
        id: testItemId,
        input: { note: 'Second version' },
      })

      const secondTimestamp = new Date(
        secondResponse.body.data.updateNotebook.noteUpdatedAt,
      )

      expect(secondTimestamp.getTime()).toBeGreaterThan(firstTimestamp.getTime())
    })

    it('preserves notebook when updating other library item fields', async () => {
      const noteContent = 'My preserved notes'
      await libraryRepository.update(testItemId, { note: noteContent })

      // Update reading progress (different field)
      await libraryRepository.update(testItemId, {
        readingProgressTopPercent: 50,
      })

      // Verify notebook is preserved
      const item = await libraryRepository.findOneBy({ id: testItemId })
      expect(item?.note).toBe(noteContent)
      expect(item?.readingProgressTopPercent).toBe(50)
    })
  })
})
