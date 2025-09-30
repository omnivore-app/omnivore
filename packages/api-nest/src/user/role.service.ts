import { Injectable } from '@nestjs/common'
import {
  UserRole,
  Permission,
  hasPermission,
  getRolePermissions,
} from './enums/user-role.enum'

@Injectable()
export class RoleService {
  /**
   * Check if a role has a specific permission
   */
  hasPermission(role: UserRole, permission: Permission): boolean {
    return hasPermission(role, permission)
  }

  /**
   * Get all permissions for a role
   */
  getRolePermissions(role: UserRole): Permission[] {
    return getRolePermissions(role)
  }

  /**
   * Get role hierarchy (roles that have equal or greater permissions)
   */
  getRoleHierarchy(role: UserRole): UserRole[] {
    const rolePermissions = this.getRolePermissions(role)
    const hierarchy: UserRole[] = []

    // Check each role to see if it has all permissions of the given role
    Object.values(UserRole).forEach((checkRole) => {
      const checkPermissions = this.getRolePermissions(checkRole)
      const hasAllPermissions = rolePermissions.every((permission) =>
        checkPermissions.includes(permission),
      )

      if (hasAllPermissions) {
        hierarchy.push(checkRole)
      }
    })

    return hierarchy
  }

  /**
   * Check if one role can manage another role
   */
  canManageRole(managerRole: UserRole, targetRole: UserRole): boolean {
    // Admins can manage anyone
    if (managerRole === UserRole.ADMIN) {
      return true
    }

    // Support can manage regular users and suspended users
    if (managerRole === UserRole.SUPPORT) {
      return [UserRole.USER, UserRole.SUSPENDED, UserRole.PENDING].includes(
        targetRole,
      )
    }

    // Users can only manage themselves (handled at service level)
    return false
  }

  /**
   * Get available roles for assignment by a given role
   */
  getAssignableRoles(assignerRole: UserRole): UserRole[] {
    switch (assignerRole) {
      case UserRole.ADMIN:
        return Object.values(UserRole)

      case UserRole.SUPPORT:
        return [
          UserRole.USER,
          UserRole.PREMIUM,
          UserRole.SUSPENDED,
          UserRole.PENDING,
        ]

      default:
        return []
    }
  }

  /**
   * Validate role transition
   */
  canTransitionRole(
    fromRole: UserRole,
    toRole: UserRole,
    assignerRole: UserRole,
  ): boolean {
    // Check if assigner can assign the target role
    const assignableRoles = this.getAssignableRoles(assignerRole)
    if (!assignableRoles.includes(toRole)) {
      return false
    }

    // Check if assigner can manage the current role
    if (!this.canManageRole(assignerRole, fromRole)) {
      return false
    }

    // Special rules for certain transitions
    if (
      fromRole === UserRole.SUSPENDED &&
      toRole !== UserRole.USER &&
      assignerRole !== UserRole.ADMIN
    ) {
      // Only admins can promote suspended users to roles other than USER
      return false
    }

    return true
  }

  /**
   * Get role display information
   */
  getRoleDisplayInfo(role: UserRole) {
    const displayInfo = {
      [UserRole.USER]: {
        name: 'User',
        description: 'Regular user with basic features',
        color: 'blue',
        priority: 1,
      },
      [UserRole.PREMIUM]: {
        name: 'Premium',
        description: 'Premium subscriber with advanced features',
        color: 'gold',
        priority: 2,
      },
      [UserRole.INTEGRATION_DEVELOPER]: {
        name: 'Developer',
        description: 'Integration developer with API access',
        color: 'purple',
        priority: 3,
      },
      [UserRole.SUPPORT]: {
        name: 'Support',
        description: 'Customer support with user management',
        color: 'green',
        priority: 4,
      },
      [UserRole.ADMIN]: {
        name: 'Administrator',
        description: 'System administrator with full access',
        color: 'red',
        priority: 5,
      },
      [UserRole.SUSPENDED]: {
        name: 'Suspended',
        description: 'Suspended user with limited access',
        color: 'orange',
        priority: 0,
      },
      [UserRole.PENDING]: {
        name: 'Pending',
        description: 'Pending verification',
        color: 'gray',
        priority: 0,
      },
    }

    return (
      displayInfo[role] || {
        name: role,
        description: 'Unknown role',
        color: 'gray',
        priority: 0,
      }
    )
  }
}
