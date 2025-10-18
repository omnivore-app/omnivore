import { faker } from '@faker-js/faker'
import { Repository } from 'typeorm'
import { User, StatusType, RegistrationType } from '../../src/user/entities/user.entity'
import { UserRole } from '../../src/user/enums/user-role.enum'
import { BaseFactory, getTestRepository } from './base.factory'
import * as bcrypt from 'bcrypt'

/**
 * UserFactory - Generate test user data
 *
 * @example
 * ```typescript
 * // Create a user in the database
 * const user = await UserFactory.create({ email: 'test@example.com' })
 *
 * // Build a user in memory (for mocking)
 * const user = UserFactory.build({ role: 'admin' })
 *
 * // Use helper methods
 * const admin = await UserFactory.admin()
 * const pendingUser = await UserFactory.pending()
 * ```
 */
class UserFactoryClass extends BaseFactory<User> {
  protected generateDefaults() {
    const firstName = faker.person.firstName()
    const lastName = faker.person.lastName()

    return {
      id: faker.string.uuid(),
      sourceUserId: faker.string.uuid(), // Required unique identifier
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      name: `${firstName} ${lastName}`,
      password: bcrypt.hashSync('password123', 10), // Default password
      role: UserRole.USER,
      status: StatusType.ACTIVE,
      source: RegistrationType.EMAIL,
      membership: 'REGULAR',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }

  protected getRepository(): Repository<User> {
    return getTestRepository(User)
  }

  /**
   * Create an admin user
   */
  async admin(overrides: Partial<User> = {}): Promise<User> {
    return this.create({
      role: UserRole.ADMIN,
      ...overrides,
    })
  }

  /**
   * Create a pending user (email not yet verified)
   */
  async pending(overrides: Partial<User> = {}): Promise<User> {
    return this.create({
      status: StatusType.PENDING,
      ...overrides,
    })
  }

  /**
   * Create an archived user
   */
  async archived(overrides: Partial<User> = {}): Promise<User> {
    return this.create({
      status: StatusType.ARCHIVED,
      ...overrides,
    })
  }

  /**
   * Create a user with a specific password (for login tests)
   */
  async withPassword(
    password: string,
    overrides: Partial<User> = {},
  ): Promise<User> {
    return this.create({
      password: bcrypt.hashSync(password, 10),
      ...overrides,
    })
  }

  /**
   * Build admin user (in memory, not saved)
   */
  buildAdmin(overrides: Partial<User> = {}): User {
    return this.build({
      role: UserRole.ADMIN,
      ...overrides,
    })
  }

  /**
   * Build pending user (in memory, not saved)
   */
  buildPending(overrides: Partial<User> = {}): User {
    return this.build({
      status: StatusType.PENDING,
      ...overrides,
    })
  }
}

// Export singleton instance
export const UserFactory = new UserFactoryClass()
