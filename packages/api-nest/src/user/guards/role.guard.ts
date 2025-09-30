import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { GqlExecutionContext } from '@nestjs/graphql'
import { UserRole } from '../enums/user-role.enum'
import { User } from '../entities/user.entity'

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<UserRole[]>(
      'roles',
      context.getHandler(),
    )

    if (!requiredRoles || requiredRoles.length === 0) {
      return true
    }

    let user: User

    // Handle both HTTP and GraphQL contexts
    if (context.getType() === 'http') {
      const request = context.switchToHttp().getRequest()
      user = request.user
    } else {
      const ctx = GqlExecutionContext.create(context)
      const request = ctx.getContext().req
      user = request.user
    }

    if (!user) {
      return false
    }

    // Check if user has any of the required roles
    return requiredRoles.includes(user.role)
  }
}
