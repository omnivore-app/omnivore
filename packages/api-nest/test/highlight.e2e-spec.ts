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
import {
  HighlightEntity,
  HighlightColor,
  RepresentationType,
  HighlightType,
} from '../src/highlight/entities/highlight.entity'
import { FOLDERS } from '../src/constants/folders.constants'

const HIGHLIGHTS_QUERY = `
  query Highlights($libraryItemId: String!) {
    highlights(libraryItemId: $libraryItemId) {
      id
      shortId
      quote
      annotation
      color
      highlightPositionPercent
      selectors
      contentVersion
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
      highlightPositionPercent
      selectors
      contentVersion
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

    const { app: testApp, moduleFixture } = await createE2EAppWithModule()
    app = testApp

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
      folder: FOLDERS.INBOX,
      itemType: 'ARTICLE',
      readableContent:
        'This is the content of the article that can be highlighted.',
    })

    const saved = await libraryRepository.save(testItem)
    testLibraryItemId = saved.id
  })

  afterAll(async () => {
    await app.close()
  }, 30000)

  const executeQuery = (
    query: string,
    variables: Record<string, unknown> = {},
  ) =>
    request(app.getHttpServer())
      .post('/api/graphql')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ query, variables })
      .expect(200) as Promise<request.Response>

  describe('Query highlights', () => {
    beforeAll(async () => {
      const shortTimestamp = Date.now().toString().slice(-8)
      const highlights = [
        {
          id: randomUUID(),
          userId,
          user: { id: userId } as any,
          libraryItemId: testLibraryItemId,
          libraryItem: { id: testLibraryItemId } as any,
          shortId: `t${shortTimestamp}1`,
          quote: 'First important quote',
          annotation: 'This is significant',
          color: HighlightColor.YELLOW,
          highlightPositionPercent: 10,
          highlightPositionAnchorIndex: 0,
          highlightType: HighlightType.HIGHLIGHT,
          representation: RepresentationType.CONTENT,
          selectors: { textQuote: { exact: 'First important quote' } },
        },
        {
          id: randomUUID(),
          userId,
          user: { id: userId } as any,
          libraryItemId: testLibraryItemId,
          libraryItem: { id: testLibraryItemId } as any,
          shortId: `t${shortTimestamp}2`,
          quote: 'Second important quote',
          annotation: 'Very interesting',
          color: HighlightColor.GREEN,
          highlightPositionPercent: 25,
          highlightPositionAnchorIndex: 0,
          highlightType: 'HIGHLIGHT' as any,
          representation: 'CONTENT' as any,
          selectors: { textQuote: { exact: 'Second important quote' } },
        },
        {
          id: randomUUID(),
          userId,
          user: { id: userId } as any,
          libraryItemId: testLibraryItemId,
          libraryItem: { id: testLibraryItemId } as any,
          shortId: `t${shortTimestamp}3`,
          quote: 'Third important quote',
          color: HighlightColor.RED,
          highlightPositionPercent: 50,
          highlightPositionAnchorIndex: 0,
          highlightType: 'HIGHLIGHT' as any,
          representation: 'CONTENT' as any,
          selectors: { textQuote: { exact: 'Third important quote' } },
        },
        {
          id: randomUUID(),
          userId,
          user: { id: userId } as any,
          libraryItemId: testLibraryItemId,
          libraryItem: { id: testLibraryItemId } as any,
          shortId: `t${shortTimestamp}4`,
          quote: 'Fourth important quote',
          annotation: 'Key insight',
          color: HighlightColor.BLUE,
          highlightPositionPercent: 75,
          highlightPositionAnchorIndex: 0,
          highlightType: 'HIGHLIGHT' as any,
          representation: 'CONTENT' as any,
          selectors: { textQuote: { exact: 'Fourth important quote' } },
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
      expect(colors).toContain(HighlightColor.YELLOW)
      expect(colors).toContain(HighlightColor.GREEN)
      expect(colors).toContain(HighlightColor.RED)
      expect(colors).toContain(HighlightColor.BLUE)
    })

    it('retrieves a single highlight by id', async () => {
      // Find the first highlight created in beforeAll
      const existing = await highlightRepository.findOne({
        where: {
          libraryItemId: testLibraryItemId,
          quote: 'First important quote',
        },
      })

      const response = await executeQuery(HIGHLIGHT_QUERY, {
        id: existing!.id,
      })

      expect(response.body.errors).toBeUndefined()
      expect(response.body.data.highlight).toMatchObject({
        id: existing!.id,
        quote: 'First important quote',
        annotation: 'This is significant',
        color: HighlightColor.YELLOW,
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
        folder: FOLDERS.INBOX,
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
        color: HighlightColor.YELLOW,
      })
      expect(response.body.data.createHighlight.id).toBeTruthy()
      expect(response.body.data.createHighlight.shortId).toBeTruthy()

      // Verify in database
      const highlight = await highlightRepository.findOneBy({
        id: response.body.data.createHighlight.id,
      })
      expect(highlight?.color).toBe(HighlightColor.YELLOW)
    })

    it('creates a highlight with red color', async () => {
      const response = await executeQuery(CREATE_HIGHLIGHT_MUTATION, {
        input: {
          libraryItemId: testLibraryItemId,
          quote: 'Important red highlight',
          color: HighlightColor.RED,
          highlightPositionPercent: 42,
        },
      })

      expect(response.body.errors).toBeUndefined()
      expect(response.body.data.createHighlight).toMatchObject({
        quote: 'Important red highlight',
        color: HighlightColor.RED,
      })

      // Verify in database
      const highlight = await highlightRepository.findOneBy({
        id: response.body.data.createHighlight.id,
      })
      expect(highlight?.color).toBe(HighlightColor.RED)
    })

    it('creates a highlight with green color', async () => {
      const response = await executeQuery(CREATE_HIGHLIGHT_MUTATION, {
        input: {
          libraryItemId: testLibraryItemId,
          quote: 'Positive green highlight',
          color: HighlightColor.GREEN,
          highlightPositionPercent: 55,
        },
      })

      expect(response.body.errors).toBeUndefined()
      expect(response.body.data.createHighlight.color).toBe(
        HighlightColor.GREEN,
      )
    })

    it('creates a highlight with blue color', async () => {
      const response = await executeQuery(CREATE_HIGHLIGHT_MUTATION, {
        input: {
          libraryItemId: testLibraryItemId,
          quote: 'Information blue highlight',
          color: HighlightColor.BLUE,
          highlightPositionPercent: 68,
        },
      })

      expect(response.body.errors).toBeUndefined()
      expect(response.body.data.createHighlight.color).toBe(HighlightColor.BLUE)
    })

    it('creates a highlight without annotation', async () => {
      const response = await executeQuery(CREATE_HIGHLIGHT_MUTATION, {
        input: {
          libraryItemId: testLibraryItemId,
          quote: 'Quote without annotation',
          color: HighlightColor.YELLOW,
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
          color: HighlightColor.YELLOW,
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
          color: HighlightColor.YELLOW,
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
          color: HighlightColor.YELLOW,
          highlightPositionPercent: 11,
        },
      })

      const response2 = await executeQuery(CREATE_HIGHLIGHT_MUTATION, {
        input: {
          libraryItemId: testLibraryItemId,
          quote: 'Second quote',
          color: HighlightColor.YELLOW,
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
        shortId: `u${Date.now().toString().slice(-8)}`,
        quote: 'Original quote',
        annotation: 'Original annotation',
        color: HighlightColor.YELLOW,
        highlightPositionPercent: 50,
        highlightPositionAnchorIndex: 0,
        highlightType: 'HIGHLIGHT' as any,
        representation: 'CONTENT' as any,
        selectors: { textQuote: { exact: 'Original quote' } },
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
        color: HighlightColor.YELLOW, // Unchanged
      })

      // Verify in database
      const highlight = await highlightRepository.findOneBy({
        id: testHighlightId,
      })
      expect(highlight?.annotation).toBe('Updated annotation')
      expect(highlight?.color).toBe(HighlightColor.YELLOW)
    })

    it('updates highlight color from yellow to red', async () => {
      const response = await executeQuery(UPDATE_HIGHLIGHT_MUTATION, {
        id: testHighlightId,
        input: { color: HighlightColor.RED },
      })

      expect(response.body.errors).toBeUndefined()
      expect(response.body.data.updateHighlight).toMatchObject({
        id: testHighlightId,
        color: HighlightColor.RED,
        annotation: 'Original annotation', // Unchanged
      })

      // Verify in database
      const highlight = await highlightRepository.findOneBy({
        id: testHighlightId,
      })
      expect(highlight?.color).toBe(HighlightColor.RED)
      expect(highlight?.annotation).toBe('Original annotation')
    })

    it('updates both annotation and color simultaneously', async () => {
      const response = await executeQuery(UPDATE_HIGHLIGHT_MUTATION, {
        id: testHighlightId,
        input: {
          annotation: 'New annotation',
          color: HighlightColor.BLUE,
        },
      })

      expect(response.body.errors).toBeUndefined()
      expect(response.body.data.updateHighlight).toMatchObject({
        id: testHighlightId,
        annotation: 'New annotation',
        color: HighlightColor.BLUE,
      })

      // Verify in database
      const highlight = await highlightRepository.findOneBy({
        id: testHighlightId,
      })
      expect(highlight?.annotation).toBe('New annotation')
      expect(highlight?.color).toBe(HighlightColor.BLUE)
    })

    it('clears annotation with empty string', async () => {
      const response = await executeQuery(UPDATE_HIGHLIGHT_MUTATION, {
        id: testHighlightId,
        input: { annotation: '' },
      })

      expect(response.body.errors).toBeUndefined()
      expect(response.body.data.updateHighlight.annotation).toBe('')

      // Verify in database
      const highlight = await highlightRepository.findOneBy({
        id: testHighlightId,
      })
      expect(highlight?.annotation).toBe('')
    })

    it('cycles through all color options', async () => {
      const colors = [
        HighlightColor.YELLOW,
        HighlightColor.RED,
        HighlightColor.GREEN,
        HighlightColor.BLUE,
      ]

      for (const color of colors) {
        const response = await executeQuery(UPDATE_HIGHLIGHT_MUTATION, {
          id: testHighlightId,
          input: { color },
        })

        expect(response.body.errors).toBeUndefined()
        expect(response.body.data.updateHighlight.color).toBe(color)
      }

      // Verify final state in database
      const highlight = await highlightRepository.findOneBy({
        id: testHighlightId,
      })
      expect(highlight?.color).toBe(HighlightColor.BLUE)
    })

    it('returns error for invalid color', async () => {
      const response = await executeQuery(UPDATE_HIGHLIGHT_MUTATION, {
        id: testHighlightId,
        input: { color: 'orange' as any as HighlightColor }, // Invalid color
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
      const before = await highlightRepository.findOneBy({
        id: testHighlightId,
      })
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
        shortId: `d${Date.now().toString().slice(-8)}`,
        quote: 'To be deleted',
        color: HighlightColor.YELLOW,
        highlightPositionPercent: 50,
        highlightPositionAnchorIndex: 0,
        highlightType: 'HIGHLIGHT' as any,
        representation: 'CONTENT' as any,
        selectors: { textQuote: { exact: 'To be deleted' } },
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
          color: HighlightColor.RED,
          highlightPositionPercent: 15,
        },
      })

      const actionItem = await executeQuery(CREATE_HIGHLIGHT_MUTATION, {
        input: {
          libraryItemId: testLibraryItemId,
          quote: 'To do item',
          annotation: 'Action required',
          color: HighlightColor.GREEN,
          highlightPositionPercent: 35,
        },
      })

      const reference = await executeQuery(CREATE_HIGHLIGHT_MUTATION, {
        input: {
          libraryItemId: testLibraryItemId,
          quote: 'Reference material',
          annotation: 'For later',
          color: HighlightColor.BLUE,
          highlightPositionPercent: 65,
        },
      })

      expect(importantQuote.body.data.createHighlight.color).toBe(
        HighlightColor.RED,
      )
      expect(actionItem.body.data.createHighlight.color).toBe(
        HighlightColor.GREEN,
      )
      expect(reference.body.data.createHighlight.color).toBe(
        HighlightColor.BLUE,
      )

      // Verify all highlights are retrievable
      const allHighlights = await executeQuery(HIGHLIGHTS_QUERY, {
        libraryItemId: testLibraryItemId,
      })

      const colors = allHighlights.body.data.highlights.map((h: any) => h.color)
      expect(colors).toContain(HighlightColor.RED)
      expect(colors).toContain(HighlightColor.GREEN)
      expect(colors).toContain(HighlightColor.BLUE)
    })

    it('supports changing highlight color based on re-evaluation', async () => {
      // Create with initial color
      const createResponse = await executeQuery(CREATE_HIGHLIGHT_MUTATION, {
        input: {
          libraryItemId: testLibraryItemId,
          quote: 'Initially interesting',
          color: HighlightColor.YELLOW,
          highlightPositionPercent: 45,
        },
      })

      const highlightId = createResponse.body.data.createHighlight.id

      // Re-evaluate as more important
      const updateResponse = await executeQuery(UPDATE_HIGHLIGHT_MUTATION, {
        id: highlightId,
        input: {
          color: HighlightColor.RED,
          annotation: 'Actually very important!',
        },
      })

      expect(updateResponse.body.data.updateHighlight).toMatchObject({
        color: HighlightColor.RED,
        annotation: 'Actually very important!',
      })
    })
  })

  describe('Robust anchored selectors', () => {
    it('creates highlight with explicit selectors JSON', async () => {
      const selectors = {
        textQuote: {
          exact: 'highlighted text',
          prefix: 'This is the ',
          suffix: ' with context',
        },
        domRange: {
          startPath: '0/1/2',
          startOffset: 5,
          endPath: '0/1/2',
          endOffset: 20,
        },
        textPosition: {
          start: 150,
          end: 165,
        },
      }

      const response = await executeQuery(CREATE_HIGHLIGHT_MUTATION, {
        input: {
          libraryItemId: testLibraryItemId,
          quote: 'highlighted text',
          color: HighlightColor.YELLOW,
          highlightPositionPercent: 30,
          selectors: selectors,
        },
      })

      expect(response.body.errors).toBeUndefined()
      expect(response.body.data.createHighlight.selectors).toBeTruthy()

      expect(response.body.data.createHighlight.selectors).toMatchObject(
        selectors,
      )

      // Verify in database
      const highlight = await highlightRepository.findOneBy({
        id: response.body.data.createHighlight.id,
      })
      expect(highlight?.selectors).toMatchObject(selectors)
    })

    it('creates highlight with contentVersion tracking', async () => {
      const contentVersion = 'test-version-hash-12345'

      const response = await executeQuery(CREATE_HIGHLIGHT_MUTATION, {
        input: {
          libraryItemId: testLibraryItemId,
          quote: 'versioned highlight',
          color: HighlightColor.GREEN,
          highlightPositionPercent: 50,
          contentVersion,
        },
      })

      expect(response.body.errors).toBeUndefined()
      expect(response.body.data.createHighlight.contentVersion).toBe(
        contentVersion,
      )

      // Verify in database
      const highlight = await highlightRepository.findOneBy({
        id: response.body.data.createHighlight.id,
      })
      expect(highlight?.contentVersion).toBe(contentVersion)
    })

    it('creates highlight without selectors (legacy format)', async () => {
      // Test backward compatibility - no selectors provided
      const response = await executeQuery(CREATE_HIGHLIGHT_MUTATION, {
        input: {
          libraryItemId: testLibraryItemId,
          quote: 'simple highlight',
          prefix: 'before ',
          suffix: ' after',
          color: HighlightColor.BLUE,
          highlightPositionPercent: 75,
        },
      })

      expect(response.body.errors).toBeUndefined()
      expect(response.body.data.createHighlight.selectors).toBeTruthy()

      // Verify fallback to textQuote selector from quote/prefix/suffix
      // GraphQL returns selectors as object, not string
      expect(
        response.body.data.createHighlight.selectors.textQuote,
      ).toMatchObject({
        exact: 'simple highlight',
        prefix: 'before ',
        suffix: ' after',
      })
    })

    it('retrieves highlights with selectors correctly', async () => {
      // Create a highlight with selectors
      await executeQuery(CREATE_HIGHLIGHT_MUTATION, {
        input: {
          libraryItemId: testLibraryItemId,
          quote: 'test quote',
          color: HighlightColor.YELLOW,
          highlightPositionPercent: 45,
          selectors: JSON.stringify({
            textQuote: { exact: 'test quote' },
          }),
        },
      })

      // Query all highlights
      const response = await executeQuery(HIGHLIGHTS_QUERY, {
        libraryItemId: testLibraryItemId,
      })

      expect(response.body.errors).toBeUndefined()
      const highlightsWithSelectors = response.body.data.highlights.filter(
        (h: any) => h.selectors,
      )
      expect(highlightsWithSelectors.length).toBeGreaterThan(0)
    })
  })
})
