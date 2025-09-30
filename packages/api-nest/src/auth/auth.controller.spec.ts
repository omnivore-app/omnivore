import { Test, TestingModule } from '@nestjs/testing'
import { BadRequestException, UnauthorizedException } from '@nestjs/common'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'
import { ConfirmEmailDto } from './dto/confirm-email.dto'
import { ResendVerificationDto } from './dto/resend-verification.dto'

describe('AuthController', () => {
  let controller: AuthController
  let authService: AuthService

  const mockAuthService = {
    validateUser: jest.fn(),
    login: jest.fn(),
    register: jest.fn(),
    confirmEmail: jest.fn(),
    resendVerification: jest.fn(),
    refreshToken: jest.fn(),
  }

  const mockResponse = {
    cookie: jest.fn(),
  } as any

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile()

    controller = module.get<AuthController>(AuthController)
    authService = module.get<AuthService>(AuthService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    }

    it('should return login result when credentials are valid', async () => {
      const mockUser = { id: '1', email: 'test@example.com' }
      const mockResult = {
        success: true,
        user: mockUser,
        accessToken: 'jwt-token',
        expiresIn: '1h',
      }

      mockAuthService.validateUser.mockResolvedValue(mockUser)
      mockAuthService.login.mockResolvedValue(mockResult)

      const result = await controller.login(loginDto, mockResponse)

      expect(authService.validateUser).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      )
      expect(authService.login).toHaveBeenCalledWith(mockUser)
      expect(result).toEqual(mockResult)
    })

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      mockAuthService.validateUser.mockResolvedValue(null)

      const result = await controller.login(loginDto, mockResponse)

      expect(result).toEqual({
        success: false,
        errorCode: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      })
      expect(authService.validateUser).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      )
      expect(authService.login).not.toHaveBeenCalled()
    })
  })

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'newuser@example.com',
      name: 'New User',
      password: 'password123',
    }

    it('should return registration result', async () => {
      const mockResult = {
        success: true,
        user: { id: '1', email: 'newuser@example.com', name: 'New User' },
        accessToken: 'jwt-token',
        expiresIn: '1h',
      }

      mockAuthService.register.mockResolvedValue(mockResult)

      const result = await controller.register(registerDto)

      expect(authService.register).toHaveBeenCalledWith(registerDto)
      expect(result).toEqual(mockResult)
    })

    it('should return pending verification result', async () => {
      const mockResult = {
        success: true,
        pendingEmailVerification: true,
      }

      mockAuthService.register.mockResolvedValue(mockResult)

      const result = await controller.register(registerDto)

      expect(authService.register).toHaveBeenCalledWith(registerDto)
      expect(result).toEqual(mockResult)
    })
  })

  describe('getProfile', () => {
    it('should return user profile', () => {
      const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' }
      const mockRequest = { user: mockUser }

      const result = controller.getProfile(mockRequest)

      expect(result).toEqual(mockUser)
    })
  })

  describe('refresh', () => {
    it('should return refreshed token', async () => {
      const mockUser = { id: '1', email: 'test@example.com' }
      const mockRequest = { user: mockUser }
      const mockResult = {
        success: true,
        accessToken: 'new-jwt-token',
        expiresIn: '1h',
      }

      mockAuthService.refreshToken.mockResolvedValue(mockResult)

      const result = await controller.refresh(mockRequest)

      expect(authService.refreshToken).toHaveBeenCalledWith(mockUser)
      expect(result).toEqual(mockResult)
    })
  })

  describe('confirmEmail', () => {
    const confirmEmailDto: ConfirmEmailDto = {
      token: 'verification-token',
    }

    it('should return login result after email confirmation', async () => {
      const mockResult = {
        success: true,
        user: { id: '1', email: 'test@example.com' },
        accessToken: 'jwt-token',
        expiresIn: '1h',
      }

      mockAuthService.confirmEmail.mockResolvedValue(mockResult)

      const result = await controller.confirmEmail(confirmEmailDto)

      expect(authService.confirmEmail).toHaveBeenCalledWith(
        'verification-token',
      )
      expect(result).toEqual(mockResult)
    })

    it('should throw BadRequestException for invalid token', async () => {
      const error = new Error('EMAIL_VERIFICATION_TOKEN_NOT_FOUND')
      mockAuthService.confirmEmail.mockRejectedValue(error)

      await expect(controller.confirmEmail(confirmEmailDto)).rejects.toThrow(
        BadRequestException,
      )
      expect(authService.confirmEmail).toHaveBeenCalledWith(
        'verification-token',
      )
    })

    it('should re-throw other errors', async () => {
      const error = new Error('Some other error')
      mockAuthService.confirmEmail.mockRejectedValue(error)

      await expect(controller.confirmEmail(confirmEmailDto)).rejects.toThrow(
        'Some other error',
      )
    })
  })

  describe('resendVerification', () => {
    const resendDto: ResendVerificationDto = {
      email: 'test@example.com',
    }

    it('should return success result', async () => {
      const mockResult = {
        success: true,
        message: 'Verification email sent',
      }

      mockAuthService.resendVerification.mockResolvedValue(mockResult)

      const result = await controller.resendVerification(resendDto)

      expect(authService.resendVerification).toHaveBeenCalledWith(
        'test@example.com',
      )
      expect(result).toEqual(mockResult)
    })

    it('should throw BadRequestException for user not found', async () => {
      const error = new Error('USER_NOT_FOUND')
      mockAuthService.resendVerification.mockRejectedValue(error)

      await expect(controller.resendVerification(resendDto)).rejects.toThrow(
        BadRequestException,
      )
    })

    it('should throw BadRequestException for already verified user', async () => {
      const error = new Error('USER_ALREADY_VERIFIED')
      mockAuthService.resendVerification.mockRejectedValue(error)

      await expect(controller.resendVerification(resendDto)).rejects.toThrow(
        BadRequestException,
      )
    })
  })
})
