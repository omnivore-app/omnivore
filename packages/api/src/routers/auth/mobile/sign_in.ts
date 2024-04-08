/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { StatusType } from '../../../entity/user'
import { userRepository } from '../../../repository/user'
import { sendNewAccountVerificationEmail } from '../../../services/send_emails'
import { comparePassword } from '../../../utils/auth'
import { logger } from '../../../utils/logger'
import { decodeAppleToken } from '../apple_auth'
import {
  AuthProvider,
  DecodeTokenResult,
  JsonResponsePayload,
} from '../auth_types'
import { decodeGoogleToken } from '../google_auth'
import { createMobileAuthPayload } from '../jwt_helpers'

export async function createMobileSignInResponse(
  isAndroid: boolean,
  token?: string,
  provider?: AuthProvider
): Promise<JsonResponsePayload> {
  try {
    if (token && provider === 'GOOGLE') {
      const decodedTokenResult = await decodeGoogleToken(token, isAndroid)
      return createAuthResponsePayload(provider, decodedTokenResult)
    }

    if (token && provider === 'APPLE') {
      const decodedTokenResult = await decodeAppleToken(token)
      return createAuthResponsePayload(provider, decodedTokenResult)
    }

    throw new Error(`Missing or unsupported provider ${provider}`)
  } catch (e) {
    logger.error('createMobileSignInResponse error', e)
    return authFailedPayload
  }
}

export async function createMobileEmailSignInResponse(
  email?: string,
  password?: string
): Promise<JsonResponsePayload> {
  try {
    if (!email || !password) {
      throw new Error('Missing username or password')
    }

    const user = await userRepository.findByEmail(email.trim())
    if (!user || !user.password || user.status === StatusType.Deleted) {
      throw new Error('user not found')
    }

    const validPassword = await comparePassword(password, user.password)
    if (!validPassword) {
      throw new Error('password is invalid')
    }

    if (user.status === StatusType.Pending && user.email) {
      await sendNewAccountVerificationEmail({
        id: user.id,
        email: user.email,
        name: user.name,
      })
      return {
        statusCode: 200,
        json: { pendingEmailVerification: true },
      }
    }

    const mobileAuthPayload = await createMobileAuthPayload(user.id)

    return {
      statusCode: 200,
      json: mobileAuthPayload,
    }
  } catch (e) {
    logger.error('createMobileEmailSignInResponse failed for user', {
      email,
      error: e,
    })
    return authFailedPayload
  }
}

const authFailedPayload = {
  statusCode: 403,
  json: { errorCodes: ['AUTH_FAILED'] },
}

async function createAuthResponsePayload(
  authProvider: AuthProvider,
  decodedTokenResult: DecodeTokenResult
): Promise<JsonResponsePayload> {
  if (!decodedTokenResult.email || decodedTokenResult.errorCode) {
    return authFailedPayload
  }

  try {
    const user = await userRepository.findOneBy({
      email: decodedTokenResult.email,
      source: authProvider,
    })
    const userId = user?.id

    if (!userId) {
      return {
        statusCode: 403,
        json: { errorCodes: ['USER_NOT_FOUND'] },
      }
    }

    const mobileAuthPayload = await createMobileAuthPayload(userId)

    return {
      statusCode: 200,
      json: mobileAuthPayload,
    }
  } catch (e) {
    logger.error('createAuthResponsePayload error', {
      error: e,
      email: decodedTokenResult.email,
    })
    return authFailedPayload
  }
}
