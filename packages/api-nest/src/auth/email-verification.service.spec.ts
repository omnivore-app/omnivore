import { Test } from '@nestjs/testing'
import { ConfigModule } from '@nestjs/config'
import { EmailVerificationService } from './email-verification.service'
import { VerificationTokenStore } from './interfaces/verification-token-store.interface'

const storeMock = (): jest.Mocked<VerificationTokenStore> => ({
  write: jest.fn(),
  read: jest.fn(),
  delete: jest.fn(),
})

describe('EmailVerificationService', () => {
  it('stores token and returns signed value', async () => {
    const store = storeMock()
    const module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true })],
      providers: [
        EmailVerificationService,
        { provide: VerificationTokenStore, useValue: store },
      ],
    }).compile()

    const service = module.get(EmailVerificationService)

    const token = await service.createVerificationToken({
      userId: 'user-1',
      email: 'user@example.com',
    })

    expect(typeof token).toBe('string')
    expect(store.write).toHaveBeenCalledWith(
      token,
      {
        userId: 'user-1',
        email: 'user@example.com',
      },
      60,
    )
  })

  it('validates token and removes when single-use', async () => {
    const store = storeMock()
    store.read.mockResolvedValue({
      userId: 'user-2',
      email: 'user2@example.com',
    })
    const module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true })],
      providers: [
        EmailVerificationService,
        { provide: VerificationTokenStore, useValue: store },
      ],
    }).compile()

    const service = module.get(EmailVerificationService)

    const result = await service.verifyToken('token-xyz', { consume: true })

    expect(result).toEqual({ userId: 'user-2', email: 'user2@example.com' })
    expect(store.delete).toHaveBeenCalledWith('token-xyz')
  })

  it('throws when token missing', async () => {
    const store = storeMock()
    store.read.mockResolvedValue(undefined)
    const module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true })],
      providers: [
        EmailVerificationService,
        { provide: VerificationTokenStore, useValue: store },
      ],
    }).compile()

    const service = module.get(EmailVerificationService)

    await expect(
      service.verifyToken('missing-token', { consume: true }),
    ).rejects.toThrow('EMAIL_VERIFICATION_TOKEN_NOT_FOUND')
    expect(store.delete).not.toHaveBeenCalled()
  })
})
