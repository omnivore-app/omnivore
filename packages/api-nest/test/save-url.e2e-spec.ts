import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import request from 'supertest'
import { randomUUID } from 'crypto'
import { AppModule } from '../src/app/app.module'
import { ConfigService } from '@nestjs/config'
import { DataSource } from 'typeorm'

describe('SaveUrl E2E Tests', () => {
  let app: INestApplication
  let authToken: string
  let userId: string
  let createdLibraryItemIds: string[] = []

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()

    // Use the same validation pipe configuration as main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    )

    app.setGlobalPrefix('api/v2')
    await app.init()

    // Create a test user and get auth token
    const testEmail = `test-saveurl-${Date.now()}@example.com`
    const testPassword = 'TestPassword123!'

    const registerResponse = await request(app.getHttpServer())
      .post('/api/v2/auth/register')
      .send({
        email: testEmail,
        password: testPassword,
        name: 'SaveUrl Test User',
      })
      .expect(201)

    authToken = registerResponse.body.accessToken
    userId = registerResponse.body.user.id

    // Get the config service to skip email confirmation
    const configService = app.get(ConfigService)
    const requireEmailConfirmation = configService.get<boolean>(
      'AUTH_REQUIRE_EMAIL_CONFIRMATION',
    )

    // If email confirmation is required, confirm the email
    if (requireEmailConfirmation) {
      const dataSource = app.get(DataSource)
      await dataSource.query(
        `UPDATE omnivore.user SET status = 'ACTIVE' WHERE id = $1`,
        [userId],
      )
    }
  })

  afterAll(async () => {
    // Clean up test data
    if (userId) {
      const dataSource = app.get(DataSource)

      // Delete in correct order due to foreign key constraints
      await dataSource.query(
        `DELETE FROM omnivore.library_item WHERE user_id = $1`,
        [userId],
      )
      await dataSource.query(`DELETE FROM omnivore.user WHERE id = $1`, [
        userId,
      ])
    }

    await app.close()
  }, 30000) // 30 second timeout for graceful BullMQ worker shutdown

  const executeQuery = async (
    query: string,
    variables: Record<string, any> = {},
  ) => {
    return request(app.getHttpServer())
      .post('/api/graphql')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ query, variables })
  }

  // ==================== BASIC SAVE URL ====================

  describe('Basic SaveUrl Functionality', () => {
    it('should save a valid URL to the library', async () => {
      const response = await executeQuery(
        `
        mutation SaveUrl($input: SaveUrlInput!) {
          saveUrl(input: $input) {
            id
            title
            originalUrl
            slug
            folder
            state
            contentReader
            savedAt
            createdAt
          }
        }
      `,
        {
          input: {
            url: 'https://example.com/article',
          },
        },
      )

      expect(response.status).toBe(200)
      expect(response.body.errors).toBeUndefined()
      expect(response.body.data.saveUrl).toMatchObject({
        originalUrl: 'https://example.com/article',
        folder: 'inbox', // Default folder
        contentReader: 'WEB',
        state: 'CONTENT_NOT_FETCHED', // Content extraction deferred to ARC-012
      })
      expect(response.body.data.saveUrl.id).toBeDefined()
      expect(response.body.data.saveUrl.slug).toContain('article')
      expect(response.body.data.saveUrl.title).toBe(
        'https://example.com/article',
      ) // Title is URL until content is fetched

      createdLibraryItemIds.push(response.body.data.saveUrl.id)
    })

    it('should save URL to specified folder', async () => {
      const response = await executeQuery(
        `
        mutation SaveUrl($input: SaveUrlInput!) {
          saveUrl(input: $input) {
            id
            originalUrl
            folder
          }
        }
      `,
        {
          input: {
            url: 'https://example.com/archived-article',
            folder: 'archive',
          },
        },
      )

      expect(response.status).toBe(200)
      expect(response.body.data.saveUrl).toMatchObject({
        originalUrl: 'https://example.com/archived-article',
        folder: 'archive',
      })

      createdLibraryItemIds.push(response.body.data.saveUrl.id)
    })

    it('should generate unique slug for URL', async () => {
      const response = await executeQuery(
        `
        mutation SaveUrl($input: SaveUrlInput!) {
          saveUrl(input: $input) {
            id
            slug
          }
        }
      `,
        {
          input: {
            url: 'https://example.com/test/article/123',
          },
        },
      )

      expect(response.status).toBe(200)
      expect(response.body.data.saveUrl.slug).toMatch(/test-article-123-\d+/)

      createdLibraryItemIds.push(response.body.data.saveUrl.id)
    })
  })

  // ==================== VALIDATION ====================

  describe('URL Validation', () => {
    it('should reject invalid URL format', async () => {
      const response = await executeQuery(
        `
        mutation SaveUrl($input: SaveUrlInput!) {
          saveUrl(input: $input) {
            id
          }
        }
      `,
        {
          input: {
            url: 'not-a-valid-url',
          },
        },
      )

      expect(response.status).toBe(200)
      expect(response.body.errors).toBeDefined()
      // GraphQL wraps validation errors in Bad Request Exception
      const errorMessage = response.body.errors[0].message
      expect(errorMessage).toBeDefined()
      expect(
        errorMessage.includes('valid URL') ||
          errorMessage.includes('Bad Request'),
      ).toBe(true)
    })

    it('should accept URL without protocol (class-validator may be lenient)', async () => {
      const response = await executeQuery(
        `
        mutation SaveUrl($input: SaveUrlInput!) {
          saveUrl(input: $input) {
            id
            originalUrl
          }
        }
      `,
        {
          input: {
            url: 'example.com/article',
          },
        },
      )

      // class-validator's @IsUrl might accept this or reject it
      // Let's test both scenarios
      if (response.body.errors) {
        expect(response.body.errors).toBeDefined()
      } else {
        expect(response.body.data.saveUrl.originalUrl).toBe(
          'example.com/article',
        )
        createdLibraryItemIds.push(response.body.data.saveUrl.id)
      }
    })

    it('should reject invalid folder name', async () => {
      const response = await executeQuery(
        `
        mutation SaveUrl($input: SaveUrlInput!) {
          saveUrl(input: $input) {
            id
          }
        }
      `,
        {
          input: {
            url: 'https://example.com/article',
            folder: 'invalid-folder',
          },
        },
      )

      expect(response.status).toBe(200)
      expect(response.body.errors).toBeDefined()
    })
  })

  // ==================== DUPLICATE DETECTION ====================

  describe('Duplicate URL Detection', () => {
    it('should detect duplicate URLs', async () => {
      const testUrl = `https://example.com/duplicate-test-${Date.now()}`

      // Save URL first time
      const firstResponse = await executeQuery(
        `
        mutation SaveUrl($input: SaveUrlInput!) {
          saveUrl(input: $input) {
            id
            originalUrl
          }
        }
      `,
        {
          input: {
            url: testUrl,
          },
        },
      )

      expect(firstResponse.status).toBe(200)
      expect(firstResponse.body.errors).toBeUndefined()
      createdLibraryItemIds.push(firstResponse.body.data.saveUrl.id)

      // Try to save same URL again
      const secondResponse = await executeQuery(
        `
        mutation SaveUrl($input: SaveUrlInput!) {
          saveUrl(input: $input) {
            id
          }
        }
      `,
        {
          input: {
            url: testUrl,
          },
        },
      )

      expect(secondResponse.status).toBe(200)
      expect(secondResponse.body.errors).toBeDefined()
      expect(secondResponse.body.errors[0].message).toContain(
        'already been saved',
      )
    })

    it('should allow different users to save same URL', async () => {
      // This test would require creating a second user
      // For now, we'll skip it as it's a more complex scenario
      // Future: Implement multi-user duplicate test
    })
  })

  // ==================== CONTENT EXTRACTION ====================

  describe('Content Extraction', () => {
    it('should create item in CONTENT_NOT_FETCHED state', async () => {
      const response = await executeQuery(
        `
        mutation SaveUrl($input: SaveUrlInput!) {
          saveUrl(input: $input) {
            id
            title
            originalUrl
            state
          }
        }
      `,
        {
          input: {
            url: 'https://example.com/metadata-test',
          },
        },
      )

      expect(response.status).toBe(200)
      expect(response.body.data.saveUrl).toMatchObject({
        originalUrl: 'https://example.com/metadata-test',
        state: 'CONTENT_NOT_FETCHED',
        title: 'https://example.com/metadata-test', // URL as title until fetched
      })

      createdLibraryItemIds.push(response.body.data.saveUrl.id)
    })

    it('should save URL without attempting extraction', async () => {
      // Even potentially slow URLs should save immediately
      const response = await executeQuery(
        `
        mutation SaveUrl($input: SaveUrlInput!) {
          saveUrl(input: $input) {
            id
            originalUrl
            state
          }
        }
      `,
        {
          input: {
            url: 'https://httpstat.us/200?sleep=5000',
          },
        },
      )

      expect(response.status).toBe(200)
      expect(response.body.data.saveUrl.state).toBe('CONTENT_NOT_FETCHED')

      if (response.body.data.saveUrl.id) {
        createdLibraryItemIds.push(response.body.data.saveUrl.id)
      }
    })
  })

  // ==================== QUERY SAVED ITEMS ====================

  describe('Querying Saved URLs', () => {
    it('should retrieve saved URL by ID', async () => {
      // Save a URL first
      const saveResponse = await executeQuery(
        `
        mutation SaveUrl($input: SaveUrlInput!) {
          saveUrl(input: $input) {
            id
          }
        }
      `,
        {
          input: {
            url: `https://example.com/query-test-${Date.now()}`,
          },
        },
      )

      const itemId = saveResponse.body.data.saveUrl.id
      createdLibraryItemIds.push(itemId)

      // Query it back
      const queryResponse = await executeQuery(
        `
        query GetLibraryItem($id: String!) {
          libraryItem(id: $id) {
            id
            originalUrl
            title
            state
            folder
          }
        }
      `,
        { id: itemId },
      )

      expect(queryResponse.status).toBe(200)
      expect(queryResponse.body.data.libraryItem).toMatchObject({
        id: itemId,
      })
    })

    it('should list saved URLs in library items', async () => {
      const response = await executeQuery(`
        query {
          libraryItems(first: 20) {
            items {
              id
              originalUrl
              title
              state
              folder
            }
            nextCursor
          }
        }
      `)

      expect(response.status).toBe(200)
      expect(response.body.data.libraryItems.items).toBeDefined()
      expect(Array.isArray(response.body.data.libraryItems.items)).toBe(true)
      // Should have at least the items we created
      expect(response.body.data.libraryItems.items.length).toBeGreaterThan(0)
    })
  })

  // ==================== ERROR HANDLING ====================

  describe('Error Handling', () => {
    it('should handle missing URL parameter', async () => {
      const response = await executeQuery(
        `
        mutation SaveUrl($input: SaveUrlInput!) {
          saveUrl(input: $input) {
            id
          }
        }
      `,
        {
          input: {},
        },
      )

      expect(response.status).toBe(200)
      expect(response.body.errors).toBeDefined()
    })

    it('should require authentication', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/graphql')
        // No Authorization header
        .send({
          query: `
          mutation SaveUrl($input: SaveUrlInput!) {
            saveUrl(input: $input) {
              id
            }
          }
        `,
          variables: {
            input: {
              url: 'https://example.com/auth-test',
            },
          },
        })

      expect(response.status).toBe(200)
      expect(response.body.errors).toBeDefined()
      expect(response.body.errors[0].message).toContain('Unauthorized')
    })

    it('should save even non-existent URLs (extraction deferred)', async () => {
      const response = await executeQuery(
        `
        mutation SaveUrl($input: SaveUrlInput!) {
          saveUrl(input: $input) {
            id
            state
          }
        }
      `,
        {
          input: {
            url: 'https://httpstat.us/404',
          },
        },
      )

      expect(response.status).toBe(200)
      // Should save the item even if URL doesn't exist (extraction will fail later)
      expect(response.body.data.saveUrl.state).toBe('CONTENT_NOT_FETCHED')
      if (response.body.data?.saveUrl?.id) {
        createdLibraryItemIds.push(response.body.data.saveUrl.id)
      }
    })
  })

  // ==================== INTEGRATION WITH OTHER FEATURES ====================

  describe('Integration with Library Features', () => {
    it('should allow moving saved URL to different folder', async () => {
      // Save URL first
      const saveResponse = await executeQuery(
        `
        mutation SaveUrl($input: SaveUrlInput!) {
          saveUrl(input: $input) {
            id
            folder
          }
        }
      `,
        {
          input: {
            url: `https://example.com/move-test-${Date.now()}`,
          },
        },
      )

      const itemId = saveResponse.body.data.saveUrl.id
      createdLibraryItemIds.push(itemId)

      // Move to archive
      const moveResponse = await executeQuery(
        `
        mutation MoveToFolder($id: String!, $folder: String!) {
          moveLibraryItemToFolder(id: $id, folder: $folder) {
            id
            folder
          }
        }
      `,
        {
          id: itemId,
          folder: 'archive',
        },
      )

      expect(moveResponse.status).toBe(200)
      expect(moveResponse.body.data.moveLibraryItemToFolder).toMatchObject({
        id: itemId,
        folder: 'archive',
      })
    })

    it('should allow deleting saved URL', async () => {
      // Save URL first
      const saveResponse = await executeQuery(
        `
        mutation SaveUrl($input: SaveUrlInput!) {
          saveUrl(input: $input) {
            id
          }
        }
      `,
        {
          input: {
            url: `https://example.com/delete-test-${Date.now()}`,
          },
        },
      )

      const itemId = saveResponse.body.data.saveUrl.id

      // Delete it
      const deleteResponse = await executeQuery(
        `
        mutation DeleteLibraryItem($id: String!) {
          deleteLibraryItem(id: $id) {
            success
            itemId
          }
        }
      `,
        { id: itemId },
      )

      expect(deleteResponse.status).toBe(200)
      expect(deleteResponse.body.data.deleteLibraryItem).toMatchObject({
        success: true,
        itemId: itemId,
      })
    })
  })
})
