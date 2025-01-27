/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import * as jwt from 'jsonwebtoken'
import jwksClient from 'jwks-rsa'
import { StatusType } from '../../entity/user'
import { env, homePageURL } from '../../env'
import { LoginErrorCode } from '../../generated/graphql'
import { userRepository } from '../../repository/user'
import { analytics } from '../../utils/analytics'
import { logger } from '../../utils/logger'
import { createSsoToken, ssoRedirectURL } from '../../utils/sso'
import { DecodeTokenResult } from './auth_types'
import {
  createPendingUserToken,
  createWebAuthToken,
  suggestedUsername,
} from './jwt_helpers'
import { DEFAULT_HOME_PATH } from '../../utils/navigation'

const appleBaseURL = 'https://appleid.apple.com'
const audienceName = 'app.omnivore.app'
const webAudienceName = 'app.omnivore'

async function fetchApplePublicKey(kid: string): Promise<string | null> {
  const client = jwksClient({
    cache: true,
    jwksUri: `${appleBaseURL}/auth/keys`,
  })

  try {
    const key: jwksClient.SigningKey = await new Promise((resolve, reject) => {
      client.getSigningKey(kid, (error, result) => {
        if (error || result === undefined) {
          return reject(error)
        }
        return resolve(result)
      })
    })
    return key.getPublicKey()
  } catch (e) {
    logger.error('fetchApplePublicKey error', e)
    return null
  }
}

export async function decodeAppleToken(
  token: string
): Promise<DecodeTokenResult> {
  const decodedToken = jwt.decode(token, { complete: true })
  const { kid, alg } = (decodedToken as any).header

  try {
    const publicKey = await fetchApplePublicKey(kid)
    if (!publicKey) {
      return { errorCode: 500 }
    }
    const jwtClaims: any = jwt.verify(token, publicKey, { algorithms: [alg] })
    const issVerified = (jwtClaims.iss ?? '') === appleBaseURL
    const audience = jwtClaims.aud ?? ''
    const audVerified = audience == webAudienceName || audience === audienceName
    if (issVerified && audVerified && jwtClaims.email) {
      return {
        email: jwtClaims.email,
        sourceUserId: jwtClaims.sub,
        name: jwtClaims.name,
      }
    } else {
      return {
        errorCode: 401,
      }
    }
  } catch (e) {
    logger.error('decodeAppleToken error', e)
    return { errorCode: 500 }
  }
}

type AppleWebAuthResponse = {
  redirectURL: string
  authToken?: string
  pendingUserToken?: string
}

type AppleUserData = {
  name?: AppleUserName
  email?: string
}

type AppleUserName = {
  firstName?: string
  lastName?: string
}

export async function handleAppleWebAuth(
  idToken: string,
  appleUserData?: AppleUserData,
  isLocal = false,
  isVercel = false
): Promise<AppleWebAuthResponse> {
  const baseURL = () => {
    if (isLocal) {
      return 'http://localhost:3000'
    }

    if (isVercel) {
      return homePageURL()
    }

    return env.client.url
  }
  const decodedTokenResult = await decodeAppleToken(idToken)
  const authFailedRedirect = `${baseURL()}/login?errorCodes=${
    LoginErrorCode.AuthFailed
  }`

  if (!decodedTokenResult.email || decodedTokenResult.errorCode) {
    return Promise.resolve({
      redirectURL: authFailedRedirect,
    })
  }

  try {
    const user = await userRepository.findOneBy({
      sourceUserId: decodedTokenResult.sourceUserId,
      source: 'APPLE',
      status: StatusType.Active,
    })
    const userId = user?.id

    if (!userId) {
      // create a temp token so the user can create a new profile
      const payload = await createTempAppleUserPayload({
        authFailedRedirect,
        appleUserData,
        baseURL: baseURL(),
        sourceUserId: decodedTokenResult.sourceUserId,
        email: decodedTokenResult.email,
      })

      return payload
    }

    const authToken = await createWebAuthToken(userId)
    if (authToken) {
      const ssoToken = createSsoToken(
        authToken,
        `${baseURL()}${DEFAULT_HOME_PATH}`
      )
      const redirectURL = isVercel
        ? ssoRedirectURL(ssoToken)
        : `${baseURL()}${DEFAULT_HOME_PATH}`

      analytics.capture({
        distinctId: user.id,
        event: 'login',
        properties: {
          method: 'apple',
          email: user.email,
          username: user.profile.username,
          env: env.server.apiEnv,
        },
      })

      return {
        authToken,
        redirectURL,
      }
    } else {
      return { redirectURL: authFailedRedirect }
    }
  } catch (e) {
    logger.info('handleAppleWebAuth error', e)
    return { redirectURL: authFailedRedirect }
  }
}

type CreateTempAppleUserPayloadInputs = {
  appleUserData?: AppleUserData
  authFailedRedirect: string
  baseURL: string
  sourceUserId?: string
  email?: string
}

async function createTempAppleUserPayload(
  inputs: CreateTempAppleUserPayloadInputs
): Promise<AppleWebAuthResponse> {
  if (!inputs.email || !inputs.sourceUserId) {
    throw new Error('missing email or sourceUserId')
  }

  const firstName = inputs.appleUserData?.name?.firstName ?? ''
  const lastName = inputs.appleUserData?.name?.lastName ?? ''
  const name = `${firstName} ${lastName}`
  const username = suggestedUsername(name)

  try {
    const pendingUserToken = await createPendingUserToken({
      email: inputs.email,
      sourceUserId: inputs.sourceUserId,
      provider: 'APPLE',
      name,
      username,
    })

    if (!pendingUserToken) {
      throw new Error('Failed to create pending user token')
    }

    return {
      redirectURL: `${inputs.baseURL}/confirm-profile?username=${username}&name=${name}`,
      pendingUserToken,
    }
  } catch {
    return { redirectURL: inputs.authFailedRedirect }
  }
}
