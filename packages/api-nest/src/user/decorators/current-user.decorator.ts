import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'
import { User } from '../entities/user.entity'

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): User => {
    // Handle both HTTP and GraphQL contexts
    if (context.getType() === 'http') {
      const request = context.switchToHttp().getRequest()
      return request.user
    } else {
      const ctx = GqlExecutionContext.create(context)
      const request = ctx.getContext().req
      return request.user
    }
  },
)
