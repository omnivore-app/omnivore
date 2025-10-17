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
import { HighlightEntity } from '../src/highlight/entities/highlight.entity'

const HIGHLIGHTS_QUERY = `
  query Highlights($libraryItemId: String!) {
    highlights(libraryItemId: $libraryItemId) {
      id
      shortId
      quote
      annotation
      color
      highlightPositionPercent
      createdAt
      updatedAt
    }
  }
`

const HIGHLIGHT_QUERY = `
  query Highlight($id: String!) {
    highlight(id: $id) {
      id
      quote
      annotation
      color
    }
  }
`

const CREATE_HIGHLIGHT_MUTATION = `
  mutation CreateHighlight($input: CreateHighlightInput!) {
    createHighlight(input: $input) {
      id
      shortId
      quote
      annotation
      color
      highlaryPositionPercent
      createdAt
    }
  }
`

const UPDATE_HIGHLIGHT_MUTATION = `
  mutation UpdateHighlight($id: String!, $input: UpdateHighlightInput!) {
    updateHighlight(id: $id, input: $input) {
      id
      annotation
      color
      updatedAt
    }
  }
`

const DELETE_HIGHLIGHT_MUTATION = `
  mutation DeleteHighlight($id: String!) {
    deleteHighlight(id: $id) {
      success
      message
      itemId
    }
  }
`

describe('Highlight GraphQL (e2e)', () => {
  let app: INestApplication
  let authToken: string
  let userId: string
  let libraryRepository: Repository<LibraryItemEntity>
  let highlightRepository: Repository<HighlightEntity>
  let testLibraryItemId: string

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

    highlightRepository = moduleFixture.get<Repository<HighlightEntity>>(
      getRepositoryToken(HighlightEntity),
    )

    const registerResponse = await request(app.getHttpServer())
      .post('/api/v2/auth/register')
      .send({
        email: `highlight-test-${Date.now()}@omnivore.app`,
        name: 'Highlight Test User',
        password: 'highlightPassword123',
      })
      .expect(201)

    authToken = registerResponse.body.accessToken
    userId = registerResponse.body.user.id

    // Create a test library item for all highlight tests
    const testItem = libraryRepository.create({
      id: randomUUID(),
      userId,
      user: { id: userId } as any,
      title: 'Test Article for Highlights',
      slug: `highlight-article-${Date.now()}`,
      originalUrl: `https://example.com/highlight-test-${Date.now()}`,
      savedAt: new Date(),
      state: LibraryItemState.SUCCEEDED,
      contentReader: ContentReaderType.WEB,
      folder: 'inbox',
      itemType: 'ARTICLE',
      readableContent: 'This is the content of the article that can be highlighted.',
    })

    const saved = await libraryRepository.save(testItem)
    testLibraryItemId = saved.id
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

  describe('Query highlights', () => {
    beforeAll(async () => {
      // Create test highlights with different colors
      const highlights = [
        {
          id: randomUUID(),
          userId,
          user: { id: userId } as any,
          libraryItemId: testLibraryItemId,
          libraryItem: { id: testLibraryItemId } as any,
          shortId: 'test001',
          quote: 'First important quote',
          annotation: 'This is significant',
          color: 'yellow',
          highlightPositionPercent: 10,
          highlightPositionAnchorIndex: 0,
          highlightType: 'HIGHLIGHT' as any,
          representation: 'CONTENT' as any,
        },
        {
          id: randomUUID(),
          userId,
          user: { id: userId } as any,
          libraryItemId: testLibraryItemId,
          libraryItem: { id: testLibraryItemId } as any,
          shortId: 'test002',
          quote: 'Second important quote',
          annotation: 'Very interesting',
          color: 'green',
          highlightPositionPercent: 25,
          highlightPositionAnchorIndex: 0,
          highlightType: 'HIGHLIGHT' as any,
          representation: 'CONTENT' as any,
        },
        {
          id: randomUUID(),
          userId,
          user: { id: userId } as any,
          libraryItemId: testLibraryItemId,
          libraryItem: { id: testLibraryItemId } as any,
          shortId: 'test003',
          quote: 'Third important quote',
          color: 'red',
          highlightPositionPercent: 50,
          highlightPositionAnchorIndex: 0,
          highlightType: 'HIGHLIGHT' as any,
          representation: 'CONTENT' as any,
        },
        {
          id: randomUUID(),
          userId,
          user: { id: userId } as any,
          libraryItemId: testLibraryItemId,
          libraryItem: { id: testLibraryItemId } as any,
          shortId: 'test004',
          quote: 'Fourth important quote',
          annotation: 'Key insight',
          color: 'blue',
          highlightPositionPercent: 75,
          highlightPositionAnchorIndex: 0,
          highlightType: 'HIGHLIGHT' as any,
          representation: 'CONTENT' as any,
        },
      ]

      await highlightRepository.save(highlights)
    })

    it('retrieves all highlights for a library item', async () => {
      const response = await executeQuery(HIGHLIGHTS_QUERY, {
        libraryItemId: testLibraryItemId,
      })

      expect(response.body.errors).toBeUndefined()
      expect(response.body.data.highlights).toHaveLength(4)
      expect(response.body.data.highlights[0]).toHaveProperty('id')
      expect(response.body.data.highlights[0]).toHaveProperty('quote')
      expect(response.body.data.highlights[0]).toHaveProperty('color')
    })

    it('returns highlights sorted by position', async () => {
      const response = await executeQuery(HIGHLIGHTS_QUERY, {
        libraryItemId: testLibraryItemId,
      })

      expect(response.body.errors).toBeUndefined()
      const positions = response.body.data.highlights.map(
        (h: any) => h.highlightPositionPercent,
      )
      expect(positions).toEqual([10, 25, 50, 75])
    })

    it('returns highlights with all color variations', async () => {
      const response = await executeQuery(HIGHLIGHTS_QUERY, {
        libraryItemId: testLibraryItemId,
      })

      expect(response.body.errors).toBeUndefined()
      const colors = response.body.data.highlights.map((h: any) => h.color)
      expect(colors).toContain('yellow')
      expect(colors).toContain('green')
      expect(colors).toContain('red')
      expect(colors).toContain('blue')
    })

    it('retrieves a single highlight by id', async () => {
      const existing = await highlightRepository.findOneBy({
        libraryItemId: testLibraryItemId,
        shortId: 'test001',
      })

      const response = await executeQuery(HIGHLIGHT_QUERY, {
        id: existing!.id,
      })

      expect(response.body.errors).toBeUndefined()
      expect(response.body.data.highlight).toMatchObject({
        id: existing!.id,
        quote: 'First important quote',
        annotation: 'This is significant',
        color: 'yellow',
      })
    })

    it('returns empty array for library item with no highlights', async () => {
      const emptyItem = libraryRepository.create({
        id: randomUUID(),
        userId,
        user: { id: userId } as any,
        title: 'Empty Article',
        slug: `empty-${Date.now()}`,
        originalUrl: `https://example.com/empty-${Date.now()}`,
        savedAt: new Date(),
        state: LibraryItemState.SUCCEEDED,
        contentReader: ContentReaderType.WEB,
        folder: 'inbox',
        itemType: 'ARTICLE',
      })

      const saved = await libraryRepository.save(emptyItem)

      const response = await executeQuery(HIGHLIGHTS_QUERY, {
        libraryItemId: saved.id,
      })

      expect(response.body.errors).toBeUndefined()
      expect(response.body.data.highlights).toHaveLength(0)
    })
  })

  describe('createHighlight', () => {
    it('creates a highlight with default yellow color', async () => {
      const response = await executeQuery(CREATE_HIGHLIGHT_MUTATION, {
        input: {
          libraryItemId: testLibraryItemId,
          quote: 'New highlight quote',
          annotation: 'My thoughts',
          highlightPositionPercent: 33,
        },
      })

      expect(response.body.errors).toBeUndefined()
      expect(response.body.data.createHighlight).toMatchObject({
        quote: 'New highlight quote',
        annotation: 'My thoughts',
        color: 'yellow',
      })
      expect(response.body.data.createHighlight.id).toBeTruthy()
      expect(response.body.data.createHighlight.shortId).toBeTruthy()

      // Verify in database
      const highlight = await highlightRepository.findOneBy({
        id: response.body.data.createHighlight.id,
      })
      expect(highlight?.color).toBe('yellow')
    })

    it('creates a highlight with red color', async () => {
      const response = await executeQuery(CREATE_HIGHLIGHT_MUTATION, {
        input: {
          libraryItemId: testLibraryItemId,
          quote: 'Important red highlight',
          color: 'red',
          highlightPositionPercent: 42,
        },
      })

      expect(response.body.errors).toBeUndefined()
      expect(response.body.data.createHighlight).toMatchObject({
        quote: 'Important red highlight',
        color: 'red',
      })

      // Verify in database
      const highlight = await highlightRepository.findOneBy({
        id: response.body.data.createHighlight.id,
      })
      expect(highlight?.color).toBe('red')
    })

    it('creates a highlight with green color', async () => {
      const response = await executeQuery(CREATE_HIGHLIGHT_MUTATION, {
        input: {
          libraryItemId: testLibraryItemId,
          quote: 'Positive green highlight',
          color: 'green',
          highlightPositionPercent: 55,
        },
      })

      expect(response.body.errors).toBeUndefined()
      expect(response.body.data.createHighlight.color).toBe('green')
    })

    it('creates a highlight with blue color', async () => {
      const response = await executeQuery(CREATE_HIGHLIGHT_MUTATION, {
        input: {
          libraryItemId: testLibraryItemId,
          quote: 'Information blue highlight',
          color: 'blue',
          highlightPositionPercent: 68,
        },
      })

      expect(response.body.errors).toBeUndefined()
      expect(response.body.data.createHighlight.color).toBe('blue')
    })

    it('creates a highlight without annotation', async () => {
      const response = await executeQuery(CREATE_HIGHLIGHT_MUTATION, {
        input: {
          libraryItemId: testLibraryItemId,
          quote: 'Quote without annotation',
          color: 'yellow',
          highlightPositionPercent: 20,
        },
      })

      expect(response.body.errors).toBeUndefined()
      expect(response.body.data.createHighlight.quote).toBe(
        'Quote without annotation',
      )
      expect(response.body.data.createHighlight.annotation).toBeNull()
    })

    it('creates a highlight with prefix and suffix context', async () => {
      const response = await executeQuery(CREATE_HIGHLIGHT_MUTATION, {
        input: {
          libraryItemId: testLibraryItemId,
          quote: 'highlighted text',
          prefix: 'This is the ',
          suffix: ' with context',
          color: 'yellow',
          highlightPositionPercent: 30,
        },
      })

      expect(response.body.errors).toBeUndefined()
      expect(response.body.data.createHighlight).toMatchObject({
        quote: 'highlighted text',
      })

      // Verify in database
      const highlight = await highlightRepository.findOneBy({
        id: response.body.data.createHighlight.id,
      })
      expect(highlight?.prefix).toBe('This is the ')
      expect(highlight?.suffix).toBe(' with context')
    })

    it('returns error for invalid color', async () => {
      const response = await executeQuery(CREATE_HIGHLIGHT_MUTATION, {
        input: {
          libraryItemId: testLibraryItemId,
          quote: 'Test quote',
          color: 'purple', // Invalid color
          highlightPositionPercent: 40,
        },
      })

      expect(response.body.errors).toBeDefined()
    })

    it('returns error for non-existent library item', async () => {
      const response = await executeQuery(CREATE_HIGHLIGHT_MUTATION, {
        input: {
          libraryItemId: randomUUID(),
          quote: 'Test quote',
          color: 'yellow',
          highlightPositionPercent: 40,
        },
      })

      expect(response.body.errors).toBeDefined()
      expect(response.body.errors[0].message).toContain('not found')
    })

    it('generates unique shortId for each highlight', async () => {
      const response1 = await executeQuery(CREATE_HIGHLIGHT_MUTATION, {
        input: {
          libraryItemId: testLibraryItemId,
          quote: 'First quote',
          color: 'yellow',
          highlightPositionPercent: 11,
        },
      })

      const response2 = await executeQuery(CREATE_HIGHLIGHT_MUTATION, {
        input: {
          libraryItemId: testLibraryItemId,
          quote: 'Second quote',
          color: 'yellow',
          highlightPositionPercent: 12,
        },
      })

      expect(response1.body.data.createHighlight.shortId).not.toBe(
        response2.body.data.createHighlight.shortId,
      )
    })
  })

  describe('updateHighlight', () => {
    let testHighlightId: string

    beforeEach(async () => {
      const highlight = highlightRepository.create({
        id: randomUUID(),
        userId,
        user: { id: userId } as any,
        libraryItemId: testLibraryItemId,
        libraryItem: { id: testLibraryItemId } as any,
        shortId: `update-${Date.now()}`,
        quote: 'Original quote',
        annotation: 'Original annotation',
        color: 'yellow',
        highlightPositionPercent: 50,
        highlightPositionAnchorIndex: 0,
        highlightType: 'HIGHLIGHT' as any,
        representation: 'CONTENT' as any,
      })

      const saved = await highlightRepository.save(highlight)
      testHighlightId = saved.id
    })

    it('updates highlight annotation', async () => {
      const response = await executeQuery(UPDATE_HIGHLIGHT_MUTATION, {
        id: testHighlightId,
        input: { annotation: 'Updated annotation' },
      })

      expect(response.body.errors).toBeUndefined()
      expect(response.body.data.updateHighlight).toMatchObject({
        id: testHighlightId,
        annotation: 'Updated annotation',
        color: 'yellow', // Unchanged
      })

      // Verify in database
      const highlight = await highlightRepository.findOneBy({ id: testHighlightId })
      expect(highlight?.annotation).toBe('Updated annotation')
      expect(highlight?.color).toBe('yellow')
    })

    it('updates highlight color from yellow to red', async () => {
      const response = await executeQuery(UPDATE_HIGHLIGHT_MUTATION, {
        id: testHighlightId,
        input: { color: 'red' },
      })

      expect(response.body.errors).toBeUndefined()
      expect(response.body.data.updateHighlight).toMatchObject({
        id: testHighlightId,
        color: 'red',
        annotation: 'Original annotation', // Unchanged
      })

      // Verify in database
      const highlight = await highlightRepository.findOneBy({ id: testHighlightId })
      expect(highlight?.color).toBe('red')
      expect(highlight?.annotation).toBe('Original annotation')
    })

    it('updates both annotation and color simultaneously', async () => {
      const response = await executeQuery(UPDATE_HIGHLIGHT_MUTATION, {
        id: testHighlightId,
        input: {
          annotation: 'New annotation',
          color: 'blue',
        },
      })

      expect(response.body.errors).toBeUndefined()
      expect(response.body.data.updateHighlight).toMatchObject({
        id: testHighlightId,
        annotation: 'New annotation',
        color: 'blue',
      })

      // Verify in database
      const highlight = await highlightRepository.findOneBy({ id: testHighlightId })
      expect(highlight?.annotation).toBe('New annotation')
      expect(highlight?.color).toBe('blue')
    })

    it('clears annotation with empty string', async () => {
      const response = await executeQuery(UPDATE_HIGHLIGHT_MUTATION, {
        id: testHighlightId,
        input: { annotation: '' },
      })

      expect(response.body.errors).toBeUndefined()
      expect(response.body.data.updateHighlight.annotation).toBe('')

      // Verify in database
      const highlight = await highlightRepository.findOneBy({ id: testHighlightId })
      expect(highlight?.annotation).toBe('')
    })

    it('cycles through all color options', async () => {
      const colors = ['yellow', 'red', 'green', 'blue']

      for (const color of colors) {
        const response = await executeQuery(UPDATE_HIGHLIGHT_MUTATION, {
          id: testHighlightId,
          input: { color },
        })

        expect(response.body.errors).toBeUndefined()
        expect(response.body.data.updateHighlight.color).toBe(color)
      }

      // Verify final state in database
      const highlight = await highlightRepository.findOneBy({ id: testHighlightId })
      expect(highlight?.color).toBe('blue')
    })

    it('returns error for invalid color', async () => {
      const response = await executeQuery(UPDATE_HIGHLIGHT_MUTATION, {
        id: testHighlightId,
        input: { color: 'orange' }, // Invalid color
      })

      expect(response.body.errors).toBeDefined()
    })

    it('returns error for non-existent highlight', async () => {
      const response = await executeQuery(UPDATE_HIGHLIGHT_MUTATION, {
        id: randomUUID(),
        input: { annotation: 'Test' },
      })

      expect(response.body.errors).toBeDefined()
      expect(response.body.errors[0].message).toContain('not found')
    })

    it('updates updatedAt timestamp', async () => {
      const before = await highlightRepository.findOneBy({ id: testHighlightId })
      const originalUpdatedAt = before!.updatedAt

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10))

      await executeQuery(UPDATE_HIGHLIGHT_MUTATION, {
        id: testHighlightId,
        input: { annotation: 'Updated' },
      })

      const after = await highlightRepository.findOneBy({ id: testHighlightId })
      expect(after!.updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime(),
      )
    })
  })

  describe('deleteHighlight', () => {
    it('deletes a highlight successfully', async () => {
      const highlight = highlightRepository.create({
        id: randomUUID(),
        userId,
        user: { id: userId } as any,
        libraryItemId: testLibraryItemId,
        libraryItem: { id: testLibraryItemId } as any,
        shortId: `delete-${Date.now()}`,
        quote: 'To be deleted',
        color: 'yellow',
        highlightPositionPercent: 50,
        highlightPositionAnchorIndex: 0,
        highlightType: 'HIGHLIGHT' as any,
        representation: 'CONTENT' as any,
      })

      const saved = await highlightRepository.save(highlight)

      const response = await executeQuery(DELETE_HIGHLIGHT_MUTATION, {
        id: saved.id,
      })

      expect(response.body.errors).toBeUndefined()
      expect(response.body.data.deleteHighlight).toMatchObject({
        success: true,
        message: 'Highlight deleted successfully',
        itemId: saved.id,
      })

      // Verify deleted in database
      const deleted = await highlightRepository.findOneBy({ id: saved.id })
      expect(deleted).toBeNull()
    })

    it('returns error for non-existent highlight', async () => {
      const response = await executeQuery(DELETE_HIGHLIGHT_MUTATION, {
        id: randomUUID(),
      })

      expect(response.body.errors).toBeDefined()
      expect(response.body.errors[0].message).toContain('not found')
    })
  })

  describe('Color-based workflows', () => {
    it('supports creating highlights with different colors for organization', async () => {
      // Create highlights with semantic colors
      const importantQuote = await executeQuery(CREATE_HIGHLIGHT_MUTATION, {
        input: {
          libraryItemId: testLibraryItemId,
          quote: 'Critical information',
          annotation: 'Must remember',
          color: 'red',
          highlightPositionPercent: 15,
        },
      })

      const actionItem = await executeQuery(CREATE_HIGHLIGHT_MUTATION, {
        input: {
          libraryItemId: testLibraryItemId,
          quote: 'To do item',
          annotation: 'Action required',
          color: 'green',
          highlightPositionPercent: 35,
        },
      })

      const reference = await executeQuery(CREATE_HIGHLIGHT_MUTATION, {
        input: {
          libraryItemId: testLibraryItemId,
          quote: 'Reference material',
          annotation: 'For later',
          color: 'blue',
          highlightPositionPercent: 65,
        },
      })

      expect(importantQuote.body.data.createHighlight.color).toBe('red')
      expect(actionItem.body.data.createHighlight.color).toBe('green')
      expect(reference.body.data.createHighlight.color).toBe('blue')

      // Verify all highlights are retrievable
      const allHighlights = await executeQuery(HIGHLIGHTS_QUERY, {
        libraryItemId: testLibraryItemId,
      })

      const colors = allHighlights.body.data.highlights.map((h: any) => h.color)
      expect(colors).toContain('red')
      expect(colors).toContain('green')
      expect(colors).toContain('blue')
    })

    it('supports changing highlight color based on re-evaluation', async () => {
      // Create with initial color
      const createResponse = await executeQuery(CREATE_HIGHLIGHT_MUTATION, {
        input: {
          libraryItemId: testLibraryItemId,
          quote: 'Initially interesting',
          color: 'yellow',
          highlightPositionPercent: 45,
        },
      })

      const highlightId = createResponse.body.data.createHighlight.id

      // Re-evaluate as more important
      const updateResponse = await executeQuery(UPDATE_HIGHLIGHT_MUTATION, {
        id: highlightId,
        input: {
          color: 'red',
          annotation: 'Actually very important!',
        },
      })

      expect(updateResponse.body.data.updateHighlight).toMatchObject({
        color: 'red',
        annotation: 'Actually very important!',
      })
    })
  })
})
