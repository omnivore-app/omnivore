import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { createE2EApp } from './helpers/create-e2e-app'

describe('GraphQL Module (e2e)', () => {
  let app: INestApplication
  let authToken: string

  beforeAll(async () => {
    app = await createE2EApp()

    const registerResponse = await request(app.getHttpServer())
      .post('/api/v2/auth/register')
      .send({
        email: `graphql-test-${Date.now()}@omnivore.app`,
        name: 'GraphQL Test User',
        password: 'graphqlPassword123',
      })
      .expect(201)

    authToken = registerResponse.body.accessToken
  })

  afterAll(async () => {
    await app.close()
  }, 30000) // 30 second timeout for graceful BullMQ worker shutdown

  it('rejects unauthenticated viewer query', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/graphql')
      .send({
        query: `
          query Viewer {
            viewer {
              id
            }
          }
        `,
      })
      .expect(200)

    expect(response.body.errors).toBeDefined()
    expect(response.body.data).toBeNull()
  })

  it('returns current user via viewer query', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/graphql')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        query: `
          query Viewer {
            viewer {
              id
              email
              name
              role
              status
            }
          }
        `,
      })
      .expect(200)

    expect(response.body.errors).toBeUndefined()
    expect(response.body.data?.viewer).toMatchObject({
      email: expect.any(String),
      name: 'GraphQL Test User',
      role: expect.any(String),
      status: 'ACTIVE',
    })
  })

  it('provides session information via session query', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/graphql')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        query: `
          query Session {
            session {
              accessToken
              tokenType
              user {
                id
                email
              }
            }
          }
        `,
      })
      .expect(200)

    expect(response.body.errors).toBeUndefined()
    expect(response.body.data?.session).toMatchObject({
      accessToken: expect.any(String),
      tokenType: 'Bearer',
      user: {
        email: expect.any(String),
      },
    })
  })
})
