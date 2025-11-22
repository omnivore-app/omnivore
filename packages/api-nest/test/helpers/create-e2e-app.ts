import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { AppModule } from '../../src/app/app.module'
import { TestConfigService } from './test-config.service'

/**
 * Create E2E Test Application
 *
 * Creates a fully configured NestJS application for E2E testing with:
 * - TestConfigService override (redirects DATABASE_* to TEST_DATABASE_*)
 * - Global validation pipes
 * - API prefix
 *
 * This centralizes all E2E test setup to avoid repetition across test files.
 *
 * @returns Initialized NestJS application ready for testing
 *
 * @example
 * ```typescript
 * describe('My E2E Tests', () => {
 *   let app: INestApplication
 *
 *   beforeAll(async () => {
 *     app = await createE2EApp()
 *   })
 *
 *   afterAll(async () => {
 *     await app.close()
 *   })
 *
 *   it('should work', async () => {
 *     const response = await request(app.getHttpServer())
 *       .get('/api/v2/health')
 *       .expect(200)
 *   })
 * })
 * ```
 */
export async function createE2EApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(ConfigService)
    .useClass(TestConfigService)
    .compile()

  const app = moduleFixture.createNestApplication()

  // Apply global validation pipes (same as main.ts)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  // Set API prefix (same as main.ts)
  app.setGlobalPrefix('api/v2')

  // Initialize the application
  await app.init()

  return app
}

/**
 * Create E2E Test Application with Custom Configuration
 *
 * Same as createE2EApp() but allows customizing the TestingModule before compilation.
 * Use this when you need to override additional providers or add custom setup.
 *
 * @param customize - Function to customize the TestingModuleBuilder
 * @returns Initialized NestJS application ready for testing
 *
 * @example
 * ```typescript
 * const app = await createE2EAppWithCustomization(builder =>
 *   builder
 *     .overrideProvider(MyService)
 *     .useValue(mockService)
 * )
 * ```
 */
export async function createE2EAppWithCustomization(
  customize: (builder: TestingModuleBuilder) => TestingModuleBuilder,
): Promise<INestApplication> {
  let builder = Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(ConfigService)
    .useClass(TestConfigService)

  // Apply custom modifications
  builder = customize(builder)

  const moduleFixture: TestingModule = await builder.compile()

  const app = moduleFixture.createNestApplication()

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  app.setGlobalPrefix('api/v2')

  await app.init()

  return app
}

/**
 * Get module fixture for accessing providers directly
 *
 * Use this when you need access to repositories or services in your tests.
 *
 * @returns Module fixture and initialized application
 *
 * @example
 * ```typescript
 * const { app, moduleFixture } = await createE2EAppWithModule()
 *
 * const userRepository = moduleFixture.get<Repository<User>>(
 *   getRepositoryToken(User)
 * )
 * ```
 */
export async function createE2EAppWithModule(): Promise<{
  app: INestApplication
  moduleFixture: TestingModule
}> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(ConfigService)
    .useClass(TestConfigService)
    .compile()

  const app = moduleFixture.createNestApplication()

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  app.setGlobalPrefix('api/v2')

  await app.init()

  return { app, moduleFixture }
}
