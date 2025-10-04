import { registerEnumType } from '@nestjs/graphql'

/**
 * User Role Enum
 *
 * Defines the role hierarchy based on test personas and workspace DSL analysis
 */
export enum UserRole {
  // Basic Users
  USER = 'user', // Regular users (Alice New, Bob Regular)
  PREMIUM = 'premium', // Premium subscribers (Carol Premium)

  // Power Users
  INTEGRATION_DEVELOPER = 'integration_developer', // API users (Integration Developer persona)

  // Administrative
  SUPPORT = 'support', // Customer support (Support & Ops persona)
  ADMIN = 'admin', // System administrators (Dave Admin)

  // Special States
  SUSPENDED = 'suspended', // Suspended users (Eve Suspended)
  PENDING = 'pending', // Email verification pending
}

/**
 * Permission Enum
 *
 * Granular permissions that can be assigned to roles
 */
export enum Permission {
  // Content Management
  LIBRARY_READ = 'library:read',
  LIBRARY_WRITE = 'library:write',
  LIBRARY_DELETE = 'library:delete',

  // Premium Features
  ADVANCED_SEARCH = 'search:advanced',
  AI_SUMMARIES = 'ai:summaries',
  UNLIMITED_HIGHLIGHTS = 'highlights:unlimited',
  EXPORT_ADVANCED = 'export:advanced',

  // Integration Features
  API_ACCESS = 'api:access',
  WEBHOOK_MANAGE = 'webhook:manage',

  // Administrative
  USER_MANAGE = 'user:manage',
  SYSTEM_ADMIN = 'system:admin',
  SUPPORT_ACCESS = 'support:access',
}

registerEnumType(UserRole, {
  name: 'UserRole',
})

registerEnumType(Permission, {
  name: 'Permission',
})

// Base permissions for different user types
const BASE_USER_PERMISSIONS = [
  Permission.LIBRARY_READ,
  Permission.LIBRARY_WRITE,
  Permission.LIBRARY_DELETE,
]

const PREMIUM_PERMISSIONS = [
  Permission.ADVANCED_SEARCH,
  Permission.AI_SUMMARIES,
  Permission.UNLIMITED_HIGHLIGHTS,
  Permission.EXPORT_ADVANCED,
]

const INTEGRATION_PERMISSIONS = [
  Permission.API_ACCESS,
  Permission.WEBHOOK_MANAGE,
]

const SUPPORT_PERMISSIONS = [Permission.USER_MANAGE, Permission.SUPPORT_ACCESS]

const ADMIN_PERMISSIONS = [Permission.SYSTEM_ADMIN]

/**
 * Role-Permission Matrix
 *
 * Defines which permissions each role has
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.USER]: [...BASE_USER_PERMISSIONS],

  [UserRole.PREMIUM]: [...BASE_USER_PERMISSIONS, ...PREMIUM_PERMISSIONS],

  [UserRole.INTEGRATION_DEVELOPER]: [
    ...BASE_USER_PERMISSIONS,
    ...INTEGRATION_PERMISSIONS,
  ],

  [UserRole.SUPPORT]: [...BASE_USER_PERMISSIONS, ...SUPPORT_PERMISSIONS],

  [UserRole.ADMIN]: [
    ...BASE_USER_PERMISSIONS,
    ...PREMIUM_PERMISSIONS,
    ...INTEGRATION_PERMISSIONS,
    ...SUPPORT_PERMISSIONS,
    ...ADMIN_PERMISSIONS,
  ],

  [UserRole.SUSPENDED]: [],

  [UserRole.PENDING]: [],
}

/**
 * Helper function to check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) || false
}

/**
 * Helper function to get all permissions for a role
 */
export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] || []
}
