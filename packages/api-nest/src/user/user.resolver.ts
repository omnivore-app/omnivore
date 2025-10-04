import { Resolver, Query } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from './decorators/current-user.decorator'
import { User } from './entities/user.entity'

@Resolver(() => User)
export class UserResolver {
  @Query(() => User, { name: 'viewer' })
  @UseGuards(JwtAuthGuard)
  viewer(@CurrentUser() user: User): User {
    return user
  }

  @Query(() => User, { name: 'me' })
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: User): User {
    return user
  }
}
