import { INestApplication } from '@nestjs/common'
import { randomUUID } from 'crypto'
import request from 'supertest'
import { createE2EApp } from './helpers/create-e2e-app'
import { FactoryRegistry } from './factories/base.factory'
import { LibraryItemFactory } from './factories/library-item.factory'
import { LibraryItemState } from '../src/library/entities/library-item.entity'

describe('Label E2E Tests', () => {
  let app: INestApplication
  let authToken: string
  let userId: string
  let createdLabelIds: string[] = []
  let testLibraryItemId: string

  beforeAll(async () => {
    app = await createE2EApp()
    FactoryRegistry.setApp(app) // Enable factories to use NestJS DI

    // Create a test user and get auth token
    const testEmail = `test-label-${Date.now()}@example.com`
    const testPassword = 'TestPassword123!'

    const registerResponse = await request(app.getHttpServer())
      .post('/api/v2/auth/register')
      .send({
        email: testEmail,
        password: testPassword,
        name: 'Label Test User',
      })
      .expect(201)

    authToken = registerResponse.body.accessToken
    userId = registerResponse.body.user.id

    // Create a test library item for label associations using factory
    const libraryItem = await LibraryItemFactory.create({
      userId,
      title: 'Test Article for Labels',
      slug: `test-article-labels-${Date.now()}`,
      originalUrl: 'https://example.com/test-labels',
      state: LibraryItemState.SUCCEEDED,
      folder: 'inbox',
    })
    testLibraryItemId = libraryItem.id
  })

  afterAll(async () => {
    FactoryRegistry.clearApp()
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

  // ==================== LABEL QUERIES ====================

  describe('Label Queries', () => {
    it('should return empty array when no labels exist', async () => {
      const response = await executeQuery(`
        query {
          labels {
            id
            name
            color
            description
            position
            internal
          }
        }
      `)

      expect(response.status).toBe(200)
      expect(response.body.data.labels).toEqual([])
    })

    it('should create and retrieve a label', async () => {
      const createResponse = await executeQuery(
        `
        mutation CreateLabel($input: CreateLabelInput!) {
          createLabel(input: $input) {
            id
            name
            color
            description
            position
            internal
          }
        }
      `,
        {
          input: {
            name: 'Important',
            color: '#FF5733',
            description: 'Important articles',
          },
        },
      )

      expect(createResponse.status).toBe(200)
      expect(createResponse.body.data.createLabel).toMatchObject({
        name: 'Important',
        color: '#FF5733',
        description: 'Important articles',
        internal: false,
      })

      const labelId = createResponse.body.data.createLabel.id
      createdLabelIds.push(labelId)

      // Query single label
      const queryResponse = await executeQuery(
        `
        query GetLabel($id: String!) {
          label(id: $id) {
            id
            name
            color
          }
        }
      `,
        { id: labelId },
      )

      expect(queryResponse.status).toBe(200)
      expect(queryResponse.body.data.label).toMatchObject({
        id: labelId,
        name: 'Important',
        color: '#FF5733',
      })
    })

    it('should retrieve all labels for a user', async () => {
      // Create another label
      const createResponse = await executeQuery(
        `
        mutation CreateLabel($input: CreateLabelInput!) {
          createLabel(input: $input) {
            id
            name
          }
        }
      `,
        {
          input: {
            name: 'Read Later',
            color: '#00FF00',
          },
        },
      )

      createdLabelIds.push(createResponse.body.data.createLabel.id)

      // Get all labels
      const response = await executeQuery(`
        query {
          labels {
            id
            name
            color
            position
          }
        }
      `)

      expect(response.status).toBe(200)
      expect(response.body.data.labels).toHaveLength(2)
      expect(response.body.data.labels).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'Important' }),
          expect.objectContaining({ name: 'Read Later' }),
        ]),
      )
    })
  })

  // ==================== LABEL MUTATIONS ====================

  describe('Label Mutations', () => {
    it('should create a label with minimal fields', async () => {
      const response = await executeQuery(
        `
        mutation CreateLabel($input: CreateLabelInput!) {
          createLabel(input: $input) {
            id
            name
            color
            description
          }
        }
      `,
        {
          input: {
            name: 'Minimal Label',
          },
        },
      )

      expect(response.status).toBe(200)
      expect(response.body.data.createLabel).toMatchObject({
        name: 'Minimal Label',
        color: '#000000', // Default color
        description: null,
      })

      createdLabelIds.push(response.body.data.createLabel.id)
    })

    it('should validate hex color format', async () => {
      const response = await executeQuery(
        `
        mutation CreateLabel($input: CreateLabelInput!) {
          createLabel(input: $input) {
            id
          }
        }
      `,
        {
          input: {
            name: 'Invalid Color',
            color: 'not-a-hex-color',
          },
        },
      )

      expect(response.status).toBe(200)
      expect(response.body.errors).toBeDefined()
      // GraphQL wraps validation errors in Bad Request Exception
      const errorMessage = response.body.errors[0].message
      expect(errorMessage).toBeDefined()
      expect(
        errorMessage.includes('hex color') ||
          errorMessage.includes('Bad Request'),
      ).toBe(true)
    })

    it('should prevent duplicate label names', async () => {
      const response = await executeQuery(
        `
        mutation CreateLabel($input: CreateLabelInput!) {
          createLabel(input: $input) {
            id
          }
        }
      `,
        {
          input: {
            name: 'Important', // Already created in previous test
          },
        },
      )

      expect(response.status).toBe(200)
      expect(response.body.errors).toBeDefined()
      expect(response.body.errors[0].message).toContain('already exists')
    })

    it('should update a label', async () => {
      const response = await executeQuery(
        `
        mutation UpdateLabel($id: String!, $input: UpdateLabelInput!) {
          updateLabel(id: $id, input: $input) {
            id
            name
            color
            description
          }
        }
      `,
        {
          id: createdLabelIds[0],
          input: {
            name: 'Very Important',
            color: '#FF0000',
            description: 'Updated description',
          },
        },
      )

      expect(response.status).toBe(200)
      expect(response.body.data.updateLabel).toMatchObject({
        id: createdLabelIds[0],
        name: 'Very Important',
        color: '#FF0000',
        description: 'Updated description',
      })
    })

    it('should delete a label', async () => {
      // Create a label to delete
      const createResponse = await executeQuery(
        `
        mutation CreateLabel($input: CreateLabelInput!) {
          createLabel(input: $input) {
            id
          }
        }
      `,
        {
          input: {
            name: 'To Delete',
          },
        },
      )

      const labelId = createResponse.body.data.createLabel.id

      // Delete the label
      const deleteResponse = await executeQuery(
        `
        mutation DeleteLabel($id: String!) {
          deleteLabel(id: $id) {
            success
            message
            itemId
          }
        }
      `,
        { id: labelId },
      )

      expect(deleteResponse.status).toBe(200)
      expect(deleteResponse.body.data.deleteLabel).toMatchObject({
        success: true,
        itemId: labelId,
      })

      // Verify label is deleted
      const queryResponse = await executeQuery(
        `
        query GetLabel($id: String!) {
          label(id: $id) {
            id
          }
        }
      `,
        { id: labelId },
      )

      expect(queryResponse.body.data.label).toBeNull()
    })
  })

  // ==================== LABEL-LIBRARY ITEM ASSOCIATIONS ====================

  describe('Label-Library Item Associations', () => {
    it('should set labels on a library item', async () => {
      const response = await executeQuery(
        `
        mutation SetLibraryItemLabels($itemId: String!, $labelIds: [String!]!) {
          setLibraryItemLabels(itemId: $itemId, labelIds: $labelIds) {
            id
            name
            color
          }
        }
      `,
        {
          itemId: testLibraryItemId,
          labelIds: [createdLabelIds[0], createdLabelIds[1]],
        },
      )

      expect(response.status).toBe(200)
      expect(response.body.data.setLibraryItemLabels).toHaveLength(2)
    })

    it('should replace existing labels when setting new ones', async () => {
      // Set to only one label
      const response = await executeQuery(
        `
        mutation SetLibraryItemLabels($itemId: String!, $labelIds: [String!]!) {
          setLibraryItemLabels(itemId: $itemId, labelIds: $labelIds) {
            id
            name
          }
        }
      `,
        {
          itemId: testLibraryItemId,
          labelIds: [createdLabelIds[0]],
        },
      )

      expect(response.status).toBe(200)
      expect(response.body.data.setLibraryItemLabels).toHaveLength(1)
      expect(response.body.data.setLibraryItemLabels[0].id).toBe(
        createdLabelIds[0],
      )
    })

    it('should clear all labels when setting empty array', async () => {
      const response = await executeQuery(
        `
        mutation SetLibraryItemLabels($itemId: String!, $labelIds: [String!]!) {
          setLibraryItemLabels(itemId: $itemId, labelIds: $labelIds) {
            id
          }
        }
      `,
        {
          itemId: testLibraryItemId,
          labelIds: [],
        },
      )

      expect(response.status).toBe(200)
      expect(response.body.data.setLibraryItemLabels).toEqual([])
    })

    it('should return labels with library item query', async () => {
      // First set some labels
      await executeQuery(
        `
        mutation SetLibraryItemLabels($itemId: String!, $labelIds: [String!]!) {
          setLibraryItemLabels(itemId: $itemId, labelIds: $labelIds) {
            id
          }
        }
      `,
        {
          itemId: testLibraryItemId,
          labelIds: [createdLabelIds[0]],
        },
      )

      // Query library item with labels
      const response = await executeQuery(
        `
        query GetLibraryItem($id: String!) {
          libraryItem(id: $id) {
            id
            title
            labels {
              id
              name
              color
            }
          }
        }
      `,
        { id: testLibraryItemId },
      )

      expect(response.status).toBe(200)
      expect(response.body.data.libraryItem.labels).toHaveLength(1)
      expect(response.body.data.libraryItem.labels[0]).toMatchObject({
        id: createdLabelIds[0],
        name: 'Very Important',
      })
    })
  })

  // ==================== VALIDATION & ERROR HANDLING ====================

  describe('Validation & Error Handling', () => {
    it('should validate label name length', async () => {
      const response = await executeQuery(
        `
        mutation CreateLabel($input: CreateLabelInput!) {
          createLabel(input: $input) {
            id
          }
        }
      `,
        {
          input: {
            name: 'a'.repeat(101), // Exceeds 100 char limit
          },
        },
      )

      expect(response.status).toBe(200)
      expect(response.body.errors).toBeDefined()
    })

    it('should validate description length', async () => {
      const response = await executeQuery(
        `
        mutation CreateLabel($input: CreateLabelInput!) {
          createLabel(input: $input) {
            id
          }
        }
      `,
        {
          input: {
            name: 'Valid Name',
            description: 'a'.repeat(501), // Exceeds 500 char limit
          },
        },
      )

      expect(response.status).toBe(200)
      expect(response.body.errors).toBeDefined()
    })

    it('should return error for non-existent label', async () => {
      const response = await executeQuery(
        `
        query GetLabel($id: String!) {
          label(id: $id) {
            id
          }
        }
      `,
        { id: randomUUID() },
      )

      expect(response.status).toBe(200)
      expect(response.body.data.label).toBeNull()
    })

    it('should return error when setting invalid label IDs', async () => {
      const response = await executeQuery(
        `
        mutation SetLibraryItemLabels($itemId: String!, $labelIds: [String!]!) {
          setLibraryItemLabels(itemId: $itemId, labelIds: $labelIds) {
            id
          }
        }
      `,
        {
          itemId: testLibraryItemId,
          labelIds: [randomUUID()],
        },
      )

      expect(response.status).toBe(200)
      expect(response.body.errors).toBeDefined()
      expect(response.body.errors[0].message).toContain('not found')
    })
  })
})
