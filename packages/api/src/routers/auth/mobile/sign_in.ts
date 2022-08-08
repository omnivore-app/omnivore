/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { decodeAppleToken } from '../apple_auth'
import { decodeGoogleToken } from '../google_auth'
import {
  DecodeTokenResult,
  JsonResponsePayload,
  AuthProvider,
} from '../auth_types'
import { createMobileAuthPayload } from '../jwt_helpers'
import UserModel from '../../../datalayer/user'
import { initModels } from '../../../server'
import { sendConfirmationEmail } from '../../../services/send_emails'
import { kx } from '../../../datalayer/knex_config'
import { StatusType } from '../../../datalayer/user/model'
import { comparePassword } from '../../../utils/auth'

export async function createMobileSignInResponse(
  token?: string,
  provider?: AuthProvider
): Promise<JsonResponsePayload> {
  try {
    if (token && provider === 'GOOGLE') {
      const decodedTokenResult = await decodeGoogleToken(token)
      return createAuthResponsePayload(provider, decodedTokenResult)
    }

    if (token && provider === 'APPLE') {
      const decodedTokenResult = await decodeAppleToken(token)
      return createAuthResponsePayload(provider, decodedTokenResult)
    }

    throw new Error(`Missing or unsupported provider ${provider}`)
  } catch (e) {
    console.log('createMobileSignInResponse error', e)
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

    const models = initModels(kx, false)
    const user = await models.user.getWhere({
      email,
    })

    if (!user?.id || !user?.password) {
      throw new Error('user not found')
    }

    const validPassword = await comparePassword(password, user.password)
    if (!validPassword) {
      throw new Error('password is invalid')
    }

    if (user.status === StatusType.Pending && user.email) {
      await sendConfirmationEmail({
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
    const model = new UserModel()
    const user = await model.getWhere({
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
    console.log('createAuthResponsePayload error', e)
    return authFailedPayload
  }
}
