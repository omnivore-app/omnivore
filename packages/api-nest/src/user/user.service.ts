import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcrypt'
import { User, StatusType, RegistrationType } from './entities/user.entity'
import { UserProfile } from './entities/profile.entity'
import { UserRole, Permission, hasPermission } from './enums/user-role.enum'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { EnvVariables } from '../config/env-variables'

// Import RegisterDto from auth module
export interface RegisterDto {
  email: string
  name: string
  password: string
  inviteCode?: string
}

export interface RegisterUserInput {
  email: string
  name: string
  passwordHash?: string
  username?: string
  bio?: string
  pictureUrl?: string
  requireEmailConfirmation?: boolean
  inviteCode?: string
  sourceUserId?: string
  registrationType?: RegistrationType
}

export interface RegisterUserResult {
  user: User
  profile: UserProfile
}

export interface CompleteRegistrationResult {
  success: boolean
  user?: {
    id: string
    email: string
    name: string
    role: string
  }
  accessToken?: string
  expiresIn?: string
  pendingEmailVerification?: boolean
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private profileRepository: Repository<UserProfile>,
    private configService: ConfigService,
  ) {}

  /**
   * Complete user registration - handles password hashing, email confirmation logic
   * This method takes RegisterDto directly and handles all user-related registration logic
   */
  async registerUserComplete(
    registerDto: RegisterDto,
  ): Promise<RegisterUserResult> {
    // Hash password
    const passwordHash = await this.hashPassword(registerDto.password)

    // Determine if email confirmation is required
    const requireConfirmation = this.configService.get<boolean>(
      EnvVariables.AUTH_REQUIRE_EMAIL_CONFIRMATION,
      false,
    )

    // Use existing registration logic
    return this.registerUser({
      email: registerDto.email,
      name: registerDto.name,
      passwordHash,
      requireEmailConfirmation: requireConfirmation,
      inviteCode: registerDto.inviteCode,
    })
  }

  /**
   * Register a new user with profile in a single transaction
   * This replaces the AccountLifecycleService logic
   */
  async registerUser(input: RegisterUserInput): Promise<RegisterUserResult> {
    const {
      email,
      name,
      username,
      bio,
      pictureUrl,
      passwordHash,
      requireEmailConfirmation,
    } = input
    const normalizedEmail = email.trim().toLowerCase()
    const normalizedUsername = (username ?? this.generateUsername(name))
      .trim()
      .toLowerCase()

    // Handle invite validation if invite code provided
    if (input.inviteCode) {
      // TODO: Implement full invite validation and group membership creation
      // For now, just log the invite code for tracking
      console.log(`User registration with invite code: ${input.inviteCode}`, {
        email: normalizedEmail,
        inviteCode: input.inviteCode,
        implementation: 'STUB - needs full InviteValidationService integration',
      })

      // In the full implementation, this would:
      // 1. Validate the invite code (expiration, max members)
      // 2. Create a GroupMembership record
      // 3. Associate the user with the group
    }

    const status = requireEmailConfirmation
      ? StatusType.PENDING
      : StatusType.ACTIVE

    // Determine registration source and sourceUserId
    const source = input.registrationType || RegistrationType.EMAIL
    const sourceUserId =
      input.sourceUserId || `email-${normalizedEmail}-${Date.now()}`

    // Create and save user
    const newUser = this.userRepository.create({
      email: normalizedEmail,
      name: name.trim(),
      password: passwordHash,
      source,
      sourceUserId,
      status,
    })

    const savedUser = await this.userRepository.save(newUser)

    // Create and save profile
    const newProfile = this.profileRepository.create({
      username: normalizedUsername,
      bio: bio ?? undefined,
      pictureUrl: pictureUrl ?? undefined,
      private: false,
      user: savedUser,
    })

    const savedProfile = await this.profileRepository.save(newProfile)

    return { user: savedUser, profile: savedProfile }
  }

  /**
   * Activate a pending user (used for email confirmation)
   */
  async activateUser(userId: string): Promise<User> {
    await this.userRepository.update(
      { id: userId },
      { status: StatusType.ACTIVE },
    )

    const result = await this.userRepository.findOne({ where: { id: userId } })

    if (!result) {
      throw new NotFoundException('User not found')
    }

    return result
  }

  private generateUsername(name: string): string {
    const base = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 20)

    const suffix = Math.floor(Math.random() * 10000)

    return base.length > 0 ? `${base}${suffix}` : `user${suffix}`
  }

  /**
   * Create a new user with profile (legacy method - consider deprecating)
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if user already exists
    const existingUser = await this.findByEmail(createUserDto.email)
    if (existingUser) {
      throw new ConflictException('User with this email already exists')
    }

    // Hash password if provided
    let hashedPassword: string | null = null
    if (createUserDto.password) {
      hashedPassword = await this.hashPassword(createUserDto.password)
    }

    // Create user
    const user = this.userRepository.create({
      name: createUserDto.name,
      email: createUserDto.email,
      password: hashedPassword,
      source: RegistrationType.EMAIL,
      sourceUserId: `${RegistrationType.EMAIL}-${createUserDto.email}-${Date.now()}`,
      role: createUserDto.role ?? UserRole.USER,
      status: StatusType.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return this.userRepository.save(user)
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { id },
    })
    return user || null
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { email },
    })
    return user || null
  }

  /**
   * Find a user by their email address and registration source.
   * @param email The user's email address.
   * @param source The registration source (GOOGLE, APPLE, EMAIL).
   * @returns The user if found, otherwise null.
   */
  async findByEmailAndSource(
    email: string,
    source: RegistrationType,
  ): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { email, source },
    })
    return user || null
  }

  /**
   * Validate user credentials for authentication
   */
  async validateCredentials(
    email: string,
    password: string,
  ): Promise<User | null> {
    const user = await this.findByEmail(email)
    if (!user || !user.password) {
      return null
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return null
    }

    // Check if user can access the system
    if (!user.canAccess()) {
      return null
    }

    return user
  }

  /**
   * Update user information
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id)
    if (!user) {
      throw new NotFoundException('User not found')
    }

    // Update user fields
    Object.assign(user, updateUserDto)

    if (updateUserDto.password) {
      user.password = await this.hashPassword(updateUserDto.password)
    }

    await this.userRepository.save(user)

    // Update profile if provided
    // if (updateUserDto.profile) {
    //   await this.profileRepository.update({ userId: id }, updateUserDto.profile)
    // }

    return this.findById(id)!
  }

  /**
   * Update user role
   */
  async updateRole(id: string, role: UserRole, reason?: string): Promise<User> {
    const user = await this.findById(id)
    if (!user) {
      throw new NotFoundException('User not found')
    }

    user.role = role
    await this.userRepository.save(user)

    return user
  }

  /**
   * Suspend user
   */
  async suspend(id: string, reason?: string): Promise<User> {
    return this.updateRole(id, UserRole.SUSPENDED, reason)
  }

  /**
   * Reactivate suspended user
   */
  async reactivate(id: string): Promise<User> {
    return this.updateRole(id, UserRole.USER)
  }

  /**
   * Check if user has specific permission
   */
  async hasPermission(
    userId: string,
    permission: Permission,
  ): Promise<boolean> {
    const user = await this.findById(userId)
    if (!user || !user.canAccess()) {
      return false
    }

    return hasPermission(user.role, permission)
  }

  /**
   * Get users by role
   */
  async findByRole(role: UserRole): Promise<User[]> {
    return this.userRepository.find({
      where: { role },
    })
  }

  /**
   * Get user statistics
   */
  async getStats() {
    const total = await this.userRepository.count()
    const active = await this.userRepository.count({
      where: { status: StatusType.ACTIVE },
    })
    const suspended = await this.userRepository.count({
      where: { role: UserRole.SUSPENDED },
    })
    const premium = await this.userRepository.count({
      where: { role: UserRole.PREMIUM },
    })

    return { total, active, suspended, premium }
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10)
  }
}
