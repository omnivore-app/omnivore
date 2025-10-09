import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import request from 'supertest'
import { AppModule } from '../src/app/app.module'
import { testDatabaseConfig } from '../src/config/test.config'

describe('Health E2E Tests', () => {
  let app: INestApplication

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideModule(TypeOrmModule)
      .useModule(TypeOrmModule.forRoot(testDatabaseConfig))
      .compile()

    app = moduleFixture.createNestApplication()
    app.setGlobalPrefix('api/v2')
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  }, 30000) // 30 second timeout for graceful BullMQ worker shutdown

  describe('GET /api/v2/health', () => {
    it('should return basic health status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v2/health')
        .expect(200)

      expect(response.body).toHaveProperty('status', 'ok')
      expect(response.body).toHaveProperty('info')
      expect(response.body).toHaveProperty('details')
      expect(response.body.info).toHaveProperty('basic-check')
      expect(response.body.info['basic-check']).toHaveProperty('status', 'up')
      expect(response.body.info['basic-check']).toHaveProperty('timestamp')
    })
  })

  describe('GET /api/v2/health/deep', () => {
    it('should return deep health status with database and redis checks', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v2/health/deep')
        .expect(200)

      expect(response.body).toHaveProperty('status')
      expect(response.body).toHaveProperty('info')
      expect(response.body).toHaveProperty('details')

      // Check that we have database and redis health indicators
      const details = response.body.details
      expect(details).toHaveProperty('database')
      expect(details).toHaveProperty('redis')
      expect(details).toHaveProperty('system')
    })

    it('should include system health metrics', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v2/health/deep')
        .expect(200)

      const systemHealth = response.body.details.system
      expect(systemHealth).toHaveProperty('status', 'up')
      expect(systemHealth).toHaveProperty('uptime')
      expect(systemHealth).toHaveProperty('uptimeHuman')
      expect(systemHealth).toHaveProperty('memory')
      expect(systemHealth).toHaveProperty('nodeVersion')
      expect(systemHealth).toHaveProperty('platform')
      expect(systemHealth).toHaveProperty('arch')
      expect(systemHealth).toHaveProperty('pid')

      // Validate memory metrics
      expect(systemHealth.memory).toHaveProperty('rss')
      expect(systemHealth.memory).toHaveProperty('heapTotal')
      expect(systemHealth.memory).toHaveProperty('heapUsed')
      expect(systemHealth.memory).toHaveProperty('external')
      expect(typeof systemHealth.memory.rss).toBe('number')
      expect(typeof systemHealth.memory.heapTotal).toBe('number')
      expect(typeof systemHealth.memory.heapUsed).toBe('number')
      expect(typeof systemHealth.memory.external).toBe('number')
    })
  })

  describe('GET /api/v2/health/full', () => {
    it('should return comprehensive health status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v2/health/full')
        .expect(200)

      expect(response.body).toHaveProperty('status')
      expect(response.body).toHaveProperty('info')
      expect(response.body).toHaveProperty('details')

      // Check that we have all health indicators
      const details = response.body.details
      expect(details).toHaveProperty('database')
      expect(details).toHaveProperty('redis')
      expect(details).toHaveProperty('system')
      expect(details).toHaveProperty('application')
    })

    it('should include application health information', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v2/health/full')
        .expect(200)

      const applicationHealth = response.body.details.application
      expect(applicationHealth).toHaveProperty('status', 'up')
      expect(applicationHealth).toHaveProperty('name', 'omnivore-api-nest')
      expect(applicationHealth).toHaveProperty('version', '1.0.0')
      expect(applicationHealth).toHaveProperty('environment')
      expect(applicationHealth).toHaveProperty('timestamp')
      expect(applicationHealth).toHaveProperty('features')

      // Validate features
      const features = applicationHealth.features
      expect(features).toHaveProperty('authentication', 'enabled')
      expect(features).toHaveProperty('emailVerification', 'enabled')
      expect(features).toHaveProperty('analytics')
      expect(features).toHaveProperty('pubsub')
      expect(features).toHaveProperty('intercom')
    })
  })

  describe('Health Check Error Handling', () => {
    it('should handle database connection gracefully when unavailable', async () => {
      // Even if database is not configured properly in test environment,
      // the health check should not crash the application
      const response = await request(app.getHttpServer()).get(
        '/api/v2/health/deep',
      )

      // Should return either 200 (healthy) or 503 (unhealthy) but not crash
      expect([200, 503]).toContain(response.status)
      expect(response.body).toHaveProperty('status')
      expect(response.body).toHaveProperty('details')
    })

    it('should handle Redis connection gracefully when unavailable', async () => {
      // Redis is not configured in test environment, but should not crash
      const response = await request(app.getHttpServer()).get(
        '/api/v2/health/deep',
      )

      expect([200, 503]).toContain(response.status)
      expect(response.body).toHaveProperty('details')

      if (response.body.details.redis) {
        // Redis health should indicate not configured or down
        const redisHealth = response.body.details.redis
        expect(['up', 'not_configured', 'down']).toContain(redisHealth.status)
      }
    })
  })
})
