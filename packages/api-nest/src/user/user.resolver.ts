import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RoleGuard } from './guards/role.guard'
import { Roles } from './decorators/roles.decorator'
import { CurrentUser } from './decorators/current-user.decorator'
import { UserService } from './user.service'
import { RoleService } from './role.service'
import { User } from './entities/user.entity'
import { UserRole, Permission } from './enums/user-role.enum'
import { UpdateUserDto } from './dto/update-user.dto'

@Resolver(() => User)
export class UserResolver {
  constructor(
    private userService: UserService,
    private roleService: RoleService,
  ) {}

  @Query(() => User, { name: 'me' })
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@CurrentUser() user: User): Promise<User> {
    return user
  }

  @Query(() => User, { name: 'user' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPPORT)
  async getUser(@Args('id') id: string): Promise<User | null> {
    return this.userService.findById(id)
  }

  @Query(() => [User], { name: 'users' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPPORT)
  async getUsers(
    @Args('role', { nullable: true }) role?: UserRole,
  ): Promise<User[]> {
    if (role) {
      return this.userService.findByRole(role)
    }
    // In a real implementation, you'd want pagination here
    return []
  }

  @Mutation(() => User)
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @CurrentUser() user: User,
    @Args('input') updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.userService.update(user.id, updateUserDto)
  }

  @Mutation(() => User)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPPORT)
  async updateUserRole(
    @Args('userId') userId: string,
    @Args('role') role: UserRole,
    @Args('reason', { nullable: true }) reason?: string,
    @CurrentUser() currentUser?: User,
  ): Promise<User> {
    // Validate role transition
    const targetUser = await this.userService.findById(userId)
    if (!targetUser) {
      throw new Error('User not found')
    }

    const canTransition = this.roleService.canTransitionRole(
      targetUser.role,
      role,
      currentUser!.role,
    )

    if (!canTransition) {
      throw new Error('Insufficient permissions to assign this role')
    }

    return this.userService.updateRole(userId, role, reason)
  }

  @Mutation(() => User)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPPORT)
  async suspendUser(
    @Args('userId') userId: string,
    @Args('reason', { nullable: true }) reason?: string,
  ): Promise<User> {
    return this.userService.suspend(userId, reason)
  }

  @Mutation(() => User)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPPORT)
  async reactivateUser(@Args('userId') userId: string): Promise<User> {
    return this.userService.reactivate(userId)
  }

  @Query(() => Object, { name: 'userStats' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPPORT)
  async getUserStats() {
    return this.userService.getStats()
  }

  @Query(() => [Permission], { name: 'myPermissions' })
  @UseGuards(JwtAuthGuard)
  async getMyPermissions(@CurrentUser() user: User): Promise<Permission[]> {
    return this.roleService.getRolePermissions(user.role)
  }

  @Query(() => Boolean, { name: 'hasPermission' })
  @UseGuards(JwtAuthGuard)
  async checkPermission(
    @CurrentUser() user: User,
    @Args('permission') permission: Permission,
  ): Promise<boolean> {
    return this.roleService.hasPermission(user.role, permission)
  }
}
