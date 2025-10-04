import { Test, TestingModule } from '@nestjs/testing'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { DataSource } from 'typeorm'
import { AuthService } from './auth.service'
import { UserService } from '../../user/user.service'
import { EmailVerificationService } from '../email-verification.service'
import { DefaultUserResourcesService } from '../default-user-resources.service'
import { NotificationClient } from '../interfaces/notification-client.interface'
import { AnalyticsService } from '../../analytics/analytics.service'
import { PubSubService } from '../../pubsub/pubsub.service'
import { IntercomService } from '../../integrations/intercom.service'
import { StructuredLogger } from '../../logging/structured-logger.service'
import {
  User,
  StatusType,
  RegistrationType,
} from '../../user/entities/user.entity'
import { UserProfile } from '../../user/entities/profile.entity'
import { RegisterDto } from '../dto/register.dto'
import { UserRole } from '../../user/enums/user-role.enum'

const createMockUser = (overrides: Partial<User> = {}): User =>
  ({
    id: '1',
    firstName: 'Test',
    lastName: 'User',
    name: 'Test User',
    email: 'test@example.com',
    source: RegistrationType.EMAIL,
    sourceUserId: 'email-test-123',
    passwordHash: 'hashed-password',
    status: StatusType.ACTIVE,
    role: UserRole.USER,
    createdAt: new Date(),
    updatedAt: new Date(),
    canAccess: () => true,
    isPending: () => false,
    ...overrides,
  }) as User

const createMockProfile = (overrides: Partial<UserProfile> = {}): UserProfile =>
  ({
    id: '1',
    username: 'test_user',
    bio: null,
    pictureUrl: null,
    isPublic: true,
    userId: '1',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }) as UserProfile

describe('AuthService', () => {
  let service: AuthService
  let jwtService: JwtService
  let configService: ConfigService
  let userService: UserService
  let emailVerificationService: EmailVerificationService
  let defaultResourcesService: DefaultUserResourcesService
  let notificationClient: NotificationClient
  let mockStructuredLogger: StructuredLogger

  const mockJwtService = {
    sign: jest.fn(),
  }

  const mockConfigService = {
    get: jest.fn(),
  }

  const mockUserService = {
    findByEmail: jest.fn(),
    validateCredentials: jest.fn(),
    registerUserComplete: jest.fn(),
    findById: jest.fn(),
    activateUser: jest.fn(),
  }

  const mockEmailVerificationService = {
    createVerificationToken: jest.fn(),
    verifyToken: jest.fn(),
  }

  const mockDefaultResourcesService = {
    provisionForUser: jest.fn(),
  }

  const mockNotificationClient = {
    sendEmailVerification: jest.fn(),
  }

  const mockDataSource = {
    createQueryRunner: jest.fn().mockReturnValue({
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        save: jest.fn(),
        find: jest.fn(),
        findOne: jest.fn(),
      },
    }),
    getRepository: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: EmailVerificationService,
          useValue: mockEmailVerificationService,
        },
        {
          provide: DefaultUserResourcesService,
          useValue: mockDefaultResourcesService,
        },
        {
          provide: NotificationClient,
          useValue: mockNotificationClient,
        },
        {
          provide: AnalyticsService,
          useValue: {
            trackUserLogin: jest.fn(),
            trackUserCreated: jest.fn(),
            trackEmailVerified: jest.fn(),
          },
        },
        {
          provide: PubSubService,
          useValue: {
            userCreated: jest.fn(),
          },
        },
        {
          provide: IntercomService,
          useValue: {
            createUserContact: jest.fn(),
          },
        },
        {
          provide: StructuredLogger,
          useValue: {
            setContext: jest.fn(),
            withContext: jest.fn().mockReturnValue({
              log: jest.fn(),
              warn: jest.fn(),
              error: jest.fn(),
            }),
            log: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)
    jwtService = module.get<JwtService>(JwtService)
    configService = module.get<ConfigService>(ConfigService)
    userService = module.get<UserService>(UserService)
    emailVerificationService = module.get<EmailVerificationService>(
      EmailVerificationService,
    )
    defaultResourcesService = module.get<DefaultUserResourcesService>(
      DefaultUserResourcesService,
    )
    notificationClient = module.get<NotificationClient>(NotificationClient)
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  describe('validateUser', () => {
    it('should return user when credentials are valid', async () => {
      const mockUser = createMockUser()

      mockUserService.validateCredentials.mockResolvedValue(mockUser)

      const result = await service.validateUser('test@example.com', 'password')

      expect(userService.validateCredentials).toHaveBeenCalledWith(
        'test@example.com',
        'password',
      )
      expect(result).toEqual(mockUser)
    })

    it('should return null when user is not found', async () => {
      mockUserService.validateCredentials.mockResolvedValue(null)

      const result = await service.validateUser('test@example.com', 'password')

      expect(userService.validateCredentials).toHaveBeenCalledWith(
        'test@example.com',
        'password',
      )
      expect(result).toBeNull()
    })

    it('should return null when credentials are invalid', async () => {
      mockUserService.validateCredentials.mockResolvedValue(null)

      const result = await service.validateUser(
        'test@example.com',
        'wrongpassword',
      )

      expect(userService.validateCredentials).toHaveBeenCalledWith(
        'test@example.com',
        'wrongpassword',
      )
      expect(result).toBeNull()
    })
  })

  describe('login', () => {
    it('should return login result with JWT token', async () => {
      const mockUser = createMockUser()
      const mockToken = 'jwt-token'

      mockJwtService.sign.mockReturnValue(mockToken)
      mockConfigService.get.mockReturnValue('1h')

      const result = await service.login(mockUser)

      expect(jwtService.sign).toHaveBeenCalledWith({
        email: mockUser.email,
        sub: mockUser.id,
        role: mockUser.role,
      })
      expect(result).toEqual({
        success: true,
        message: 'Login successful',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          role: mockUser.role,
        },
        accessToken: mockToken,
        expiresIn: '1h',
      })
    })
  })

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'newuser@example.com',
      name: 'New User',
      password: 'password123',
    }

    it('should register user and return login result when email confirmation not required', async () => {
      const mockUser = createMockUser({
        email: 'newuser@example.com',
        name: 'New User',
      })
      const mockProfile = createMockProfile({
        username: 'newuser',
      })
      const mockResult = { user: mockUser, profile: mockProfile }
      const mockLoginResult = {
        success: true,
        message: 'Login successful',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          role: mockUser.role,
        },
        accessToken: 'jwt-token',
        expiresIn: '1h',
      }

      mockUserService.registerUserComplete.mockResolvedValue(mockResult)
      mockDefaultResourcesService.provisionForUser.mockResolvedValue(undefined)
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'AUTH_REQUIRE_EMAIL_CONFIRMATION') return false
        if (key === 'NODE_ENV') return 'test' // Skip seeding in tests
        if (key === 'JWT_EXPIRES_IN') return '1h'
        return undefined
      })
      mockJwtService.sign.mockReturnValue('jwt-token')

      const result = await service.register(registerDto)

      expect(userService.registerUserComplete).toHaveBeenCalledWith(registerDto)
      expect(defaultResourcesService.provisionForUser).toHaveBeenCalledWith(
        '1',
        {
          username: 'newuser',
        },
      )
      expect(result).toEqual(mockLoginResult)
    })

    it('should register user and return pending verification when email confirmation required', async () => {
      const mockUser = createMockUser({
        email: 'newuser@example.com',
        name: 'New User',
        status: StatusType.PENDING,
      })
      const mockProfile = createMockProfile({
        username: 'newuser',
      })
      const mockResult = { user: mockUser, profile: mockProfile }
      const mockToken = 'verification-token'

      mockUserService.registerUserComplete.mockResolvedValue(mockResult)
      mockDefaultResourcesService.provisionForUser.mockResolvedValue(undefined)
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'AUTH_REQUIRE_EMAIL_CONFIRMATION') return true
        if (key === 'NODE_ENV') return 'test' // Skip seeding in tests
        return undefined
      })
      mockEmailVerificationService.createVerificationToken.mockResolvedValue(
        mockToken,
      )
      mockNotificationClient.sendEmailVerification.mockResolvedValue(undefined)

      const result = await service.register(registerDto)

      expect(userService.registerUserComplete).toHaveBeenCalledWith(registerDto)
      expect(defaultResourcesService.provisionForUser).toHaveBeenCalledWith(
        '1',
        {
          username: 'newuser',
        },
      )
      expect(
        emailVerificationService.createVerificationToken,
      ).toHaveBeenCalledWith({
        userId: '1',
        email: 'newuser@example.com',
      })
      expect(notificationClient.sendEmailVerification).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        name: 'New User',
        token: mockToken,
      })
      expect(result).toEqual({
        success: true,
        message:
          'Registration successful. Please check your email for verification.',
        redirectUrl: '/auth/email-login',
        pendingEmailVerification: true,
      })
    })
  })

  describe('confirmEmail', () => {
    it('should activate pending user and return login result', async () => {
      const mockPayload = {
        userId: '1',
        email: 'test@example.com',
      }
      const mockUser = createMockUser({ status: StatusType.PENDING })
      const mockActivatedUser = createMockUser({ status: StatusType.ACTIVE })
      const mockLoginResult = {
        success: true,
        message: 'Login successful',
        user: {
          id: mockActivatedUser.id,
          email: mockActivatedUser.email,
          name: mockActivatedUser.name,
          role: mockActivatedUser.role,
        },
        accessToken: 'jwt-token',
        expiresIn: '1h',
      }

      mockEmailVerificationService.verifyToken.mockResolvedValue(mockPayload)
      mockUserService.findById.mockResolvedValue(mockUser)
      mockUserService.activateUser.mockResolvedValue(mockActivatedUser)
      mockJwtService.sign.mockReturnValue('jwt-token')
      mockConfigService.get.mockReturnValue('1h')

      const result = await service.confirmEmail('verification-token')

      expect(emailVerificationService.verifyToken).toHaveBeenCalledWith(
        'verification-token',
        {
          consume: true,
        },
      )
      expect(userService.findById).toHaveBeenCalledWith('1')
      expect(userService.activateUser).toHaveBeenCalledWith('1')
      expect(result).toEqual(mockLoginResult)
    })

    it('should return login result for already active user', async () => {
      const mockPayload = {
        userId: '1',
        email: 'test@example.com',
      }
      const mockUser = createMockUser({ status: StatusType.ACTIVE })
      const mockLoginResult = {
        success: true,
        message: 'Login successful',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          role: mockUser.role,
        },
        accessToken: 'jwt-token',
        expiresIn: '1h',
      }

      mockEmailVerificationService.verifyToken.mockResolvedValue(mockPayload)
      mockUserService.findById.mockResolvedValue(mockUser)
      mockJwtService.sign.mockReturnValue('jwt-token')
      mockConfigService.get.mockReturnValue('1h')

      const result = await service.confirmEmail('verification-token')

      expect(emailVerificationService.verifyToken).toHaveBeenCalledWith(
        'verification-token',
        {
          consume: true,
        },
      )
      expect(userService.findById).toHaveBeenCalledWith('1')
      expect(userService.activateUser).not.toHaveBeenCalled()
      expect(result).toEqual(mockLoginResult)
    })

    it('should throw error when user not found', async () => {
      const mockPayload = {
        userId: '1',
        email: 'test@example.com',
      }

      mockEmailVerificationService.verifyToken.mockResolvedValue(mockPayload)
      mockUserService.findById.mockResolvedValue(null)

      await expect(service.confirmEmail('verification-token')).rejects.toThrow(
        'USER_NOT_FOUND',
      )

      expect(emailVerificationService.verifyToken).toHaveBeenCalledWith(
        'verification-token',
        {
          consume: true,
        },
      )
      expect(userService.findById).toHaveBeenCalledWith('1')
    })
  })

  describe('refreshToken', () => {
    it('should return new JWT token', async () => {
      const mockUser = createMockUser()
      const mockToken = 'new-jwt-token'

      mockJwtService.sign.mockReturnValue(mockToken)
      mockConfigService.get.mockReturnValue('1h')

      const result = await service.refreshToken(mockUser)

      expect(jwtService.sign).toHaveBeenCalledWith({
        email: mockUser.email,
        sub: mockUser.id,
        role: mockUser.role,
      })
      expect(result).toEqual({
        success: true,
        accessToken: mockToken,
        expiresIn: '1h',
      })
    })
  })

  describe('resendVerification', () => {
    it('should send verification email for pending user', async () => {
      const mockUser = createMockUser({
        status: StatusType.PENDING,
        email: 'test@example.com',
        name: 'Test User',
      })
      const mockToken = 'verification-token'

      mockUserService.findByEmail.mockResolvedValue(mockUser)
      mockEmailVerificationService.createVerificationToken.mockResolvedValue(
        mockToken,
      )
      mockNotificationClient.sendEmailVerification.mockResolvedValue(undefined)

      const result = await service.resendVerification('test@example.com')

      expect(userService.findByEmail).toHaveBeenCalledWith('test@example.com')
      expect(
        emailVerificationService.createVerificationToken,
      ).toHaveBeenCalledWith({
        userId: '1',
        email: 'test@example.com',
      })
      expect(notificationClient.sendEmailVerification).toHaveBeenCalledWith({
        email: 'test@example.com',
        name: 'Test User',
        token: mockToken,
      })
      expect(result).toEqual({
        success: true,
        message: 'Verification email sent',
      })
    })

    it('should throw error when user not found', async () => {
      mockUserService.findByEmail.mockResolvedValue(null)

      await expect(
        service.resendVerification('test@example.com'),
      ).rejects.toThrow('USER_NOT_FOUND')

      expect(userService.findByEmail).toHaveBeenCalledWith('test@example.com')
    })

    it('should throw error when user is already verified', async () => {
      const mockUser = createMockUser({ status: StatusType.ACTIVE })

      mockUserService.findByEmail.mockResolvedValue(mockUser)

      await expect(
        service.resendVerification('test@example.com'),
      ).rejects.toThrow('USER_ALREADY_VERIFIED')

      expect(userService.findByEmail).toHaveBeenCalledWith('test@example.com')
    })
  })
})
