/**
 * Test Personas for E2E Authentication Testing
 *
 * These personas represent different user types and access scenarios
 * to ensure comprehensive coverage of authentication flows
 */

export interface TestPersona {
  id: string
  name: string
  email: string
  password: string
  role: string
  description: string
  expectedAccess: string[]
  restrictions: string[]
}

export const TEST_PERSONAS: TestPersona[] = [
  {
    id: 'new-user',
    name: 'Alice New',
    email: 'alice.new@test.omnivore.app',
    password: 'password123',
    role: 'user',
    description: 'Brand new user registering for the first time',
    expectedAccess: ['profile', 'library', 'basic-features'],
    restrictions: ['admin-features', 'premium-features'],
  },
  {
    id: 'returning-user',
    name: 'Bob Regular',
    email: 'bob.regular@test.omnivore.app',
    password: 'password123',
    role: 'user',
    description: 'Existing user with established account',
    expectedAccess: ['profile', 'library', 'basic-features', 'saved-articles'],
    restrictions: ['admin-features', 'premium-features'],
  },
  {
    id: 'premium-user',
    name: 'Carol Premium',
    email: 'carol.premium@test.omnivore.app',
    password: 'password123',
    role: 'premium',
    description: 'Premium subscriber with enhanced features',
    expectedAccess: [
      'profile',
      'library',
      'basic-features',
      'premium-features',
      'advanced-search',
    ],
    restrictions: ['admin-features'],
  },
  {
    id: 'admin-user',
    name: 'Dave Admin',
    email: 'dave.admin@test.omnivore.app',
    password: 'password123',
    role: 'admin',
    description: 'Administrator with full system access',
    expectedAccess: [
      'profile',
      'library',
      'basic-features',
      'premium-features',
      'admin-features',
    ],
    restrictions: [],
  },
  {
    id: 'suspended-user',
    name: 'Eve Suspended',
    email: 'eve.suspended@test.omnivore.app',
    password: 'password123',
    role: 'suspended',
    description: 'Suspended user with limited access',
    expectedAccess: ['profile'], 
    restrictions: [
      'library',
      'basic-features',
      'premium-features',
      'admin-features',
    ],
  },
  {
    id: 'oauth-user',
    name: 'Frank OAuth',
    email: 'frank.oauth@test.omnivore.app',
    password: '', // OAuth users don't have passwords
    role: 'user',
    description: 'User who registered via OAuth (Google/Apple)',
    expectedAccess: ['profile', 'library', 'basic-features'],
    restrictions: ['password-change', 'admin-features'],
  },
]

export const INVALID_CREDENTIALS = {
  wrongPassword: {
    email: 'alice.new@test.omnivore.app',
    password: 'wrongpassword',
  },
  nonExistentUser: {
    email: 'nonexistent@test.omnivore.app',
    password: 'password123',
  },
  invalidEmail: {
    email: 'invalid-email',
    password: 'password123',
  },
  emptyCredentials: {
    email: '',
    password: '',
  },
}
