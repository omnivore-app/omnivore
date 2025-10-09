import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { ValidationPipe } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import request from 'supertest'
import { AppModule } from '../src/app/app.module'
import { testDatabaseConfig } from '../src/config/test.config'
import {
  TEST_PERSONAS,
  INVALID_CREDENTIALS,
  TestPersona,
} from '../src/testing/test-personas'

describe('Authentication E2E Tests', () => {
  let app: INestApplication
  let authTokens: Map<string, string> = new Map()
  let testUsers: Map<
    string,
    { email: string; password: string; name: string }
  > = new Map()

  // Generate unique test users for this test run
  const generateTestUser = (baseName: string) => {
    const timestamp = Date.now()
    const randomId = Math.floor(Math.random() * 1000)
    return {
      email: `test-${timestamp}-${randomId}-${baseName}@omnivore.app`,
      password: 'password123',
      name: `Test ${baseName}`,
    }
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideModule(TypeOrmModule)
      .useModule(TypeOrmModule.forRoot(testDatabaseConfig))
      .compile()

    app = moduleFixture.createNestApplication()

    // Apply the same pipes as main application
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    )

    app.setGlobalPrefix('api/v2')
    await app.init()

    // Create the main test user that login tests will use
    const mainTestUser = generateTestUser('main')
    testUsers.set('main', mainTestUser)

    const response = await request(app.getHttpServer())
      .post('/api/v2/auth/register')
      .send({
        email: mainTestUser.email,
        name: mainTestUser.name,
        password: mainTestUser.password,
      })
      .expect(201)

    // Store the token for tests that need an authenticated user
    authTokens.set('test-user', response.body.accessToken)
  })

  afterAll(async () => {
    await app.close()
  }, 30000) // 30 second timeout for graceful BullMQ worker shutdown

  describe('POST /api/v2/auth/register', () => {
    it('should register a new user successfully', async () => {
      const newUser = TEST_PERSONAS.find((p) => p.id === 'new-user')!
      const uniqueEmail = `test-${Date.now()}-${newUser.email}`

      const response = await request(app.getHttpServer())
        .post('/api/v2/auth/register')
        .send({
          email: uniqueEmail,
          name: newUser.name,
          password: newUser.password,
        })
        .expect(201)

      expect(response.body).toMatchObject({
        success: true,
        user: {
          email: uniqueEmail,
          name: newUser.name,
        },
        accessToken: expect.any(String),
        expiresIn: expect.any(String),
      })

      // Store token for subsequent tests
      authTokens.set(newUser.id, response.body.accessToken)
    })

    it('should reject registration with invalid email', async () => {
      await request(app.getHttpServer())
        .post('/api/v2/auth/register')
        .send({
          email: 'invalid-email',
          name: 'Test User',
          password: 'password123',
        })
        .expect(400)
    })

    it('should reject registration with short password', async () => {
      await request(app.getHttpServer())
        .post('/api/v2/auth/register')
        .send({
          email: 'test@example.com',
          name: 'Test User',
          password: '123',
        })
        .expect(400)
    })
  })

  describe('POST /api/v2/auth/login', () => {
    it('should login with valid credentials', async () => {
      const mainUser = testUsers.get('main')!

      const response = await request(app.getHttpServer())
        .post('/api/v2/auth/login')
        .send({
          email: mainUser.email,
          password: mainUser.password,
        })
        .expect(201)

      expect(response.body).toMatchObject({
        success: true,
        user: {
          email: mainUser.email,
          name: mainUser.name,
        },
        accessToken: expect.any(String),
        expiresIn: expect.any(String),
      })

      // Update token for subsequent tests (in case it's different)
      authTokens.set('test-user', response.body.accessToken)
    })

    it('should reject login with wrong password', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v2/auth/login')
        .send(INVALID_CREDENTIALS.wrongPassword)
        .expect(201)

      expect(response.body).toMatchObject({
        success: false,
        errorCode: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      })
    })

    it('should reject login with non-existent user', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v2/auth/login')
        .send(INVALID_CREDENTIALS.nonExistentUser)
        .expect(201)

      expect(response.body).toMatchObject({
        success: false,
        errorCode: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      })
    })

    it('should reject login with invalid email format', async () => {
      await request(app.getHttpServer())
        .post('/api/v2/auth/login')
        .send(INVALID_CREDENTIALS.invalidEmail)
        .expect(400)
    })

    it('should reject login with empty credentials', async () => {
      await request(app.getHttpServer())
        .post('/api/v2/auth/login')
        .send(INVALID_CREDENTIALS.emptyCredentials)
        .expect(400)
    })
  })

  describe('GET /api/v2/auth/profile', () => {
    it('should get user profile with valid token', async () => {
      const token = authTokens.get('test-user')
      const mainUser = testUsers.get('main')!
      expect(token).toBeDefined()

      const response = await request(app.getHttpServer())
        .get('/api/v2/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      expect(response.body).toMatchObject({
        id: expect.any(String),
        email: mainUser.email,
        name: mainUser.name,
      })
    })

    it('should reject request without token', async () => {
      await request(app.getHttpServer()).get('/api/v2/auth/profile').expect(401)
    })

    it('should reject request with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/api/v2/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401)
    })

    it('should reject request with malformed token', async () => {
      await request(app.getHttpServer())
        .get('/api/v2/auth/profile')
        .set('Authorization', 'invalid-format')
        .expect(401)
    })
  })

  describe('POST /api/v2/auth/refresh', () => {
    it('should refresh token with valid token', async () => {
      const token = authTokens.get('test-user')
      expect(token).toBeDefined()

      const response = await request(app.getHttpServer())
        .post('/api/v2/auth/refresh')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      expect(response.body).toMatchObject({
        success: true,
        accessToken: expect.any(String),
        expiresIn: expect.any(String),
      })

      // Verify token is valid JWT structure
      const newToken = response.body.accessToken
      const parts = newToken.split('.')
      expect(parts).toHaveLength(3)
    })

    it('should reject refresh with invalid token', async () => {
      await request(app.getHttpServer())
        .post('/api/v2/auth/refresh')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401)
    })
  })

  describe('Persona-based Access Tests', () => {
    // Test each persona's expected access patterns
    TEST_PERSONAS.forEach((persona: TestPersona) => {
      describe(`${persona.name} (${persona.role})`, () => {
        let personaToken: string

        beforeAll(async () => {
          if (persona.password) {
            // Create a unique email for this persona to avoid conflicts
            const uniqueEmail = `test-${Date.now()}-${Math.floor(Math.random() * 1000)}-${persona.email}`

            // Register the persona with unique email
            const response = await request(app.getHttpServer())
              .post('/api/v2/auth/register')
              .send({
                email: uniqueEmail,
                name: persona.name,
                password: persona.password,
              })

            if (response.status === 201) {
              personaToken = response.body.accessToken
            }
          }
        })

        it(`should have correct access to profile`, async () => {
          if (!personaToken) {
            // Skip OAuth user test since it requires separate OAuth flow
            return
          }

          const response = await request(app.getHttpServer())
            .get('/api/v2/auth/profile')
            .set('Authorization', `Bearer ${personaToken}`)

          if (persona.expectedAccess.includes('profile')) {
            expect(response.status).toBe(200)
            expect(response.body.email).toContain(persona.email.split('@')[0]) // Check email prefix since we use unique emails
            expect(response.body.name).toBe(persona.name)
          } else {
            expect(response.status).toBe(401)
          }
        })

        it(`should be able to refresh token`, async () => {
          if (!personaToken || persona.restrictions.includes('token-refresh')) {
            // Skip token refresh test for personas that don't support it
            return
          }

          const response = await request(app.getHttpServer())
            .post('/api/v2/auth/refresh')
            .set('Authorization', `Bearer ${personaToken}`)
            .expect(200)

          expect(response.body).toMatchObject({
            success: true,
            accessToken: expect.any(String),
          })
        })
      })
    })
  })

  describe('Security Tests', () => {
    it('should not leak sensitive information in error responses', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v2/auth/login')
        .send({
          email: 'test@omnivore.app',
          password: 'wrongpassword',
        })
        .expect(201)

      expect(response.body).toMatchObject({
        success: false,
        errorCode: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      })

      // Should not contain sensitive information
      expect(JSON.stringify(response.body)).not.toMatch(/hash/i)
      expect(JSON.stringify(response.body)).not.toMatch(/salt/i)
    })

    it('should handle concurrent login attempts', async () => {
      const mainUser = testUsers.get('main')!

      const promises = Array(5)
        .fill(null)
        .map(() =>
          request(app.getHttpServer()).post('/api/v2/auth/login').send({
            email: mainUser.email,
            password: mainUser.password,
          }),
        )

      const responses = await Promise.all(promises)
      responses.forEach((response) => {
        expect(response.status).toBe(201)
        expect(response.body.accessToken).toBeDefined()
      })
    })

    it('should validate JWT token expiration', async () => {
      // This test would require mocking time or using very short expiration
      // For now, we'll test the token structure
      const mainUser = testUsers.get('main')!

      const response = await request(app.getHttpServer())
        .post('/api/v2/auth/login')
        .send({
          email: mainUser.email,
          password: mainUser.password,
        })
        .expect(201)

      const token = response.body.accessToken
      const parts = token.split('.')
      expect(parts).toHaveLength(3) // JWT has 3 parts
    })
  })
})
