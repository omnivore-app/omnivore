/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { userRepository } from '../../../repository/user'
import { createUser } from '../../../services/create_user'
import { hashPassword } from '../../../utils/auth'
import { logger } from '../../../utils/logger'
import { decodeAppleToken } from '../apple_auth'
import { isValidSignupRequest } from '../auth_router'
import {
  AuthProvider,
  DecodeTokenResult,
  JsonResponsePayload,
  PendingUserTokenPayload,
} from '../auth_types'
import { decodeGoogleToken } from '../google_auth'
import { createPendingUserToken, suggestedUsername } from '../jwt_helpers'
import { env } from '../../../env'

export async function createMobileSignUpResponse(
  isAndroid: boolean,
  token?: string,
  provider?: AuthProvider,
  name?: string
): Promise<JsonResponsePayload> {
  try {
    if (token && provider === 'GOOGLE') {
      const decodedTokenResult = await decodeGoogleToken(token, isAndroid)
      return createSignUpResponsePayload(
        provider,
        decodedTokenResult,
        name ?? ''
      )
    }

    if (token && provider === 'APPLE') {
      const decodedTokenResult = await decodeAppleToken(token)
      return createSignUpResponsePayload(
        provider,
        decodedTokenResult,
        name ?? ''
      )
    }

    throw new Error(`Missing or unsupported provider ${provider}`)
  } catch (e) {
    logger.info('createMobileSignUpResponse error', e)
    return signUpFailedPayload
  }
}

export async function createMobileEmailSignUpResponse(
  requestBody: any
): Promise<JsonResponsePayload> {
  try {
    if (!isValidSignupRequest(requestBody)) {
      throw new Error('Missing username, password, name, or username')
    }
    const { email, password, name, username } = requestBody

    // trim whitespace in email address
    const trimmedEmail = email.trim()
    const hashedPassword = await hashPassword(password)

    await createUser({
      email: trimmedEmail,
      provider: 'EMAIL',
      sourceUserId: trimmedEmail,
      name: name.trim(),
      username: username.trim().toLowerCase(),
      password: hashedPassword,
      pendingConfirmation: !env.dev.autoVerify,
    })

    return {
      statusCode: 200,
      json: {},
    }
  } catch (e) {
    logger.info('error creating mobile email sign up response', e)
    return signUpFailedPayload
  }
}

const signUpFailedPayload = {
  statusCode: 403,
  json: { errorCodes: ['AUTH_FAILED'] },
}

async function createSignUpResponsePayload(
  provider: AuthProvider,
  decodedTokenResult: DecodeTokenResult,
  name: string
): Promise<JsonResponsePayload> {
  const { errorCode, sourceUserId, email } = decodedTokenResult

  try {
    if (errorCode || !(sourceUserId && email)) {
      throw new Error(`missing sign up params or token decoding failed`)
    }

    // check if user exists
    const existingUser = await userRepository.findOneBy({ email })

    if (existingUser) {
      return {
        statusCode: 400,
        json: { errorCodes: ['USER_ALREADY_EXISTS'] },
      }
    }

    const username = suggestedUsername(name)

    const pendingUserTokenPayload: PendingUserTokenPayload = {
      sourceUserId,
      email,
      provider,
      name,
      username,
    }

    const pendingUserToken = await createPendingUserToken(
      pendingUserTokenPayload
    )

    const pendingUserProfile = {
      name,
      username,
      bio: '',
    }

    return {
      statusCode: 200,
      json: { pendingUserToken, pendingUserProfile },
    }
  } catch (e) {
    logger.info('createSignUpResponsePayload error', e)
    return signUpFailedPayload
  }
}
