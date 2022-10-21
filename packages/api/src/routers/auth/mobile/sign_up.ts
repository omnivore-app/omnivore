/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { decodeAppleToken } from '../apple_auth'
import { decodeGoogleToken } from '../google_auth'
import {
  DecodeTokenResult,
  JsonResponsePayload,
  AuthProvider,
  PendingUserTokenPayload,
} from '../auth_types'
import { createPendingUserToken, suggestedUsername } from '../jwt_helpers'
import UserModel from '../../../datalayer/user'
import { hashPassword } from '../../../utils/auth'
import { createUser } from '../../../services/create_user'

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
    console.log('createMobileSignUpResponse error', e)
    return signUpFailedPayload
  }
}

export async function createMobileEmailSignUpResponse(
  email?: string,
  password?: string,
  username?: string,
  name?: string
): Promise<JsonResponsePayload> {
  try {
    if (!email || !password || !username || !name) {
      throw new Error('Missing username, password, name, or username')
    }

    const hashedPassword = await hashPassword(password)

    await createUser({
      email,
      provider: 'EMAIL',
      sourceUserId: email,
      name,
      username: username.toLowerCase(),
      password: hashedPassword,
      pendingConfirmation: true,
    })

    return {
      statusCode: 200,
      json: {},
    }
  } catch (e) {
    console.log('error', e)
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
    const userModel = new UserModel()
    const existingUser = await userModel.getWhere({ email })

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
    console.log('createSignUpResponsePayload error', e)
    return signUpFailedPayload
  }
}
