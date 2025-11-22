import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

/**
 * Test ConfigService that redirects DATABASE_* queries to TEST_DATABASE_* values
 *
 * This ensures that when DatabaseModule reads DATABASE_* from ConfigService,
 * it actually gets TEST_DATABASE_* values from the testcontainer.
 *
 * Usage in E2E tests:
 * ```typescript
 * .overrideProvider(ConfigService)
 * .useClass(TestConfigService)
 * ```
 */
@Injectable()
export class TestConfigService extends ConfigService {
  /**
   * Intercept get() calls and redirect DATABASE_* to TEST_DATABASE_*
   */
  get<T = any>(propertyPath: string, defaultValue?: T): T {
    // Redirect DATABASE_* to TEST_DATABASE_*
    const redirections: Record<string, string> = {
      DATABASE_HOST: 'TEST_DATABASE_HOST',
      DATABASE_PORT: 'TEST_DATABASE_PORT',
      DATABASE_NAME: 'TEST_DATABASE_NAME',
      DATABASE_USER: 'TEST_DATABASE_USER',
      DATABASE_PASSWORD: 'TEST_DATABASE_PASSWORD',
    }

    // If asking for DATABASE_*, return TEST_DATABASE_* instead
    if (redirections[propertyPath]) {
      const testKey = redirections[propertyPath]
      const testValue = super.get<T>(testKey, defaultValue)

      // Log for debugging (only in test environment)
      if (process.env.NODE_ENV === 'test' && process.env.DEBUG_TEST_CONFIG) {
        console.log(
          `[TestConfigService] Redirecting ${propertyPath} → ${testKey} = ${testValue}`,
        )
      }

      return testValue
    }

    // For all other keys, use normal behavior
    return super.get<T>(propertyPath, defaultValue)
  }
}
