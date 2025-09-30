import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ConfigService } from '@nestjs/config'
import { NotFoundException } from '@nestjs/common'
import { UserService } from './user.service'
import { User, StatusType, RegistrationType } from './entities/user.entity'
import { UserProfile } from './entities/profile.entity'
import * as bcrypt from 'bcrypt'

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}))

const createMockUser = (overrides: Partial<User> = {}): User =>
  ({
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    firstName: 'Test',
    lastName: 'User',
    password: 'hashed-password',
    role: 'user',
    source: RegistrationType.EMAIL,
    sourceUserId: 'email-test-123',
    status: StatusType.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
    canAccess: jest.fn().mockReturnValue(true),
    isPending: jest.fn().mockReturnValue(false),
    ...overrides,
  }) as User

const createMockProfile = (overrides: Partial<UserProfile> = {}): UserProfile =>
  ({
    id: '1',
    userId: '1',
    username: 'testuser',
    bio: 'Test bio',
    pictureUrl: 'https://example.com/avatar.jpg',
    private: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }) as UserProfile

describe('UserService', () => {
  let service: UserService
  let userRepository: Repository<User>
  let profileRepository: Repository<UserProfile>
  let configService: ConfigService

  const mockUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  }

  const mockProfileRepository = {
    create: jest.fn(),
    save: jest.fn(),
  }

  const mockConfigService = {
    get: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(UserProfile),
          useValue: mockProfileRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile()

    service = module.get<UserService>(UserService)
    userRepository = module.get<Repository<User>>(getRepositoryToken(User))
    profileRepository = module.get<Repository<UserProfile>>(
      getRepositoryToken(UserProfile),
    )
    configService = module.get<ConfigService>(ConfigService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('create', () => {
    it('should create a user successfully', async () => {
      const createUserDto = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
      }

      const mockUser = createMockUser()
      const hashedPassword = 'hashed-password'

      // Mock findByEmail to return null (user doesn't exist)
      mockUserRepository.findOne.mockResolvedValue(null)
      // Mock password hashing
      ;(bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword)
      // Mock user creation
      mockUserRepository.create.mockReturnValue(mockUser)
      mockUserRepository.save.mockResolvedValue(mockUser)

      const result = await service.create(createUserDto)

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      })
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10)
      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser)
      expect(result).toBe(mockUser)
    })
  })

  describe('findById', () => {
    it('should return a user when found', async () => {
      const userId = '1'
      const mockUser = createMockUser()
      mockUserRepository.findOne.mockResolvedValue(mockUser)

      const result = await service.findById(userId)

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      })
      expect(result).toBe(mockUser)
    })

    it('should return null when user not found', async () => {
      const userId = 'non-existent'
      mockUserRepository.findOne.mockResolvedValue(null)

      const result = await service.findById(userId)

      expect(result).toBeNull()
    })
  })

  describe('findByEmail', () => {
    it('should return a user when found', async () => {
      const email = 'test@example.com'
      const mockUser = createMockUser()
      mockUserRepository.findOne.mockResolvedValue(mockUser)

      const result = await service.findByEmail(email)

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: email.toLowerCase() },
      })
      expect(result).toBe(mockUser)
    })

    it('should call repository with email as provided', async () => {
      const email = 'TEST@EXAMPLE.COM'
      mockUserRepository.findOne.mockResolvedValue(null)

      await service.findByEmail(email)

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'TEST@EXAMPLE.COM' },
      })
    })
  })

  describe('validateCredentials', () => {
    it('should return user when credentials are valid', async () => {
      const email = 'test@example.com'
      const password = 'password123'
      const mockUser = createMockUser()

      mockUserRepository.findOne.mockResolvedValue(mockUser)
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)

      const result = await service.validateCredentials(email, password)

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: email.toLowerCase() },
      })
      expect(bcrypt.compare).toHaveBeenCalledWith(password, mockUser.password)
      expect(result).toBe(mockUser)
    })

    it('should return null when user not found', async () => {
      const email = 'nonexistent@example.com'
      const password = 'password123'

      mockUserRepository.findOne.mockResolvedValue(null)

      const result = await service.validateCredentials(email, password)

      expect(result).toBeNull()
    })

    it('should return null when password is invalid', async () => {
      const email = 'test@example.com'
      const password = 'wrongpassword'
      const mockUser = createMockUser()

      mockUserRepository.findOne.mockResolvedValue(mockUser)
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)

      const result = await service.validateCredentials(email, password)

      expect(result).toBeNull()
    })
  })

  describe('hashPassword', () => {
    it('should hash password with bcrypt', async () => {
      const password = 'password123'
      const hashedPassword = 'hashed-password'

      ;(bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword)

      const result = await service.hashPassword(password)

      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10)
      expect(result).toBe(hashedPassword)
    })
  })

  describe('registerUser', () => {
    it('should register user and profile using repositories', async () => {
      const registerInput = {
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: 'hashed-password',
        requireEmailConfirmation: false,
      }

      const mockUser = createMockUser()
      const mockProfile = createMockProfile()

      mockUserRepository.create.mockReturnValue(mockUser)
      mockUserRepository.save.mockResolvedValue(mockUser)
      mockProfileRepository.create.mockReturnValue(mockProfile)
      mockProfileRepository.save.mockResolvedValue(mockProfile)

      const result = await service.registerUser(registerInput)

      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashed-password',
        source: 'EMAIL',
        sourceUserId: expect.stringContaining('email-test@example.com-'),
        status: 'ACTIVE',
      })
      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser)
      expect(mockProfileRepository.create).toHaveBeenCalledWith({
        username: expect.any(String),
        bio: undefined,
        pictureUrl: undefined,
        private: false,
        user: mockUser,
      })
      expect(mockProfileRepository.save).toHaveBeenCalledWith(mockProfile)
      expect(result).toEqual({ user: mockUser, profile: mockProfile })
    })

    it('should handle repository errors gracefully', async () => {
      const registerInput = {
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: 'hashed-password',
        requireEmailConfirmation: false,
      }

      const mockUser = createMockUser()
      mockUserRepository.create.mockReturnValue(mockUser)
      mockUserRepository.save.mockRejectedValue(new Error('Database error'))

      await expect(service.registerUser(registerInput)).rejects.toThrow(
        'Database error',
      )
    })

    it('should create pending user when email confirmation required', async () => {
      const registerInput = {
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: 'hashed-password',
        requireEmailConfirmation: true,
      }

      const mockUser = createMockUser({ status: StatusType.PENDING })
      const mockProfile = createMockProfile()

      mockUserRepository.create.mockReturnValue(mockUser)
      mockUserRepository.save.mockResolvedValue(mockUser)
      mockProfileRepository.create.mockReturnValue(mockProfile)
      mockProfileRepository.save.mockResolvedValue(mockProfile)

      const result = await service.registerUser(registerInput)

      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashed-password',
        source: 'EMAIL',
        sourceUserId: expect.stringContaining('email-test@example.com-'),
        status: 'PENDING',
      })
      expect(result.user.status).toBe(StatusType.PENDING)
    })
  })

  describe('registerUserComplete', () => {
    it('should hash password and call registerUser', async () => {
      const registerDto = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
      }

      const hashedPassword = 'hashed-password'
      const mockResult = {
        user: createMockUser(),
        profile: createMockProfile(),
      }

      ;(bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword)
      mockConfigService.get.mockReturnValue(false)

      // Mock the registerUser method
      jest.spyOn(service, 'registerUser').mockResolvedValue(mockResult)

      const result = await service.registerUserComplete(registerDto)

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10)
      expect(service.registerUser).toHaveBeenCalledWith({
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: hashedPassword,
        requireEmailConfirmation: false,
        inviteCode: undefined,
      })
      expect(result).toBe(mockResult)
    })
  })

  describe('activateUser', () => {
    it('should activate user and return updated user', async () => {
      const userId = '1'
      const mockUpdatedUser = createMockUser({ status: StatusType.ACTIVE })

      mockUserRepository.update.mockResolvedValue({ affected: 1 })
      mockUserRepository.findOne.mockResolvedValue(mockUpdatedUser)

      const result = await service.activateUser(userId)

      expect(mockUserRepository.update).toHaveBeenCalledWith(
        { id: userId },
        { status: StatusType.ACTIVE },
      )
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      })
      expect(result).toEqual(mockUpdatedUser)
    })

    it('should throw NotFoundException when user not found', async () => {
      const userId = 'non-existent'

      mockUserRepository.update.mockResolvedValue({ affected: 1 })
      mockUserRepository.findOne.mockResolvedValue(null)

      await expect(service.activateUser(userId)).rejects.toThrow(
        NotFoundException,
      )
    })
  })
})
