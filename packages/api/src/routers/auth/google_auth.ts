import { google, oauth2_v2 as oauthV2 } from 'googleapis'
import { OAuth2Client } from 'googleapis-common'
import url from 'url'
import { StatusType } from '../../entity/user'
import { env, homePageURL } from '../../env'
import { LoginErrorCode } from '../../generated/graphql'
import { userRepository } from '../../repository/user'
import { logger } from '../../utils/logger'
import { ARCHIVE_ACCOUNT_PATH, DEFAULT_HOME_PATH } from '../../utils/navigation'
import { createSsoToken, ssoRedirectURL } from '../../utils/sso'
import { DecodeTokenResult } from './auth_types'
import { createPendingUserToken, createWebAuthToken } from './jwt_helpers'

export const googleAuthMobile = (): OAuth2Client =>
  new google.auth.OAuth2(env.google.auth.clientId, env.google.auth.secret)

export const googleAuth = (redirectUrl?: string): OAuth2Client =>
  new google.auth.OAuth2(
    env.google.auth.clientId,
    env.google.auth.secret,
    url.resolve(env.server.gateway_url, redirectUrl || '')
  )

const defaultScopes = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
]

export const generateGoogleLoginURL = (
  auth: typeof google.auth.OAuth2.prototype,
  redirectUrl: string,
  state: string
): string => {
  return auth.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: defaultScopes,
    state: state,
    redirect_uri: url.resolve(env.server.gateway_url, redirectUrl),
  })
}

export const validateGoogleUser = async (
  authCode: string,
  registerAction?: boolean | null,
  isMobile?: boolean | null
): Promise<oauthV2.Schema$Userinfo | undefined> => {
  try {
    const auth = isMobile
      ? googleAuthMobile()
      : googleAuth('/api/auth/google-login/login')
    const { tokens } = await auth.getToken(authCode)
    auth.setCredentials(tokens)
    const oauth2 = google.oauth2({ version: 'v2', auth })
    const result = await oauth2.userinfo.get()

    return result.data
  } catch (e) {
    return undefined
  }
}

const iosClientId = env.google.auth.iosClientId
const webClientId = env.google.auth.clientId
const androidClientId = env.google.auth.androidClientId

const googleWebClient = new OAuth2Client(webClientId)
const googleIOSClient = new OAuth2Client(iosClientId)

export async function decodeGoogleToken(
  idToken: string,
  isAndroid: boolean
): Promise<DecodeTokenResult> {
  try {
    const googleMobileClient = isAndroid ? googleWebClient : googleIOSClient

    const loginTicket = await googleMobileClient.verifyIdToken({
      idToken,
      audience: [iosClientId, webClientId, androidClientId],
    })

    const email = loginTicket.getPayload()?.email
    const sourceUserId = loginTicket.getUserId() || undefined
    return { email, sourceUserId }
  } catch (e) {
    logger.info('decodeGoogleToken error', e)
    return { errorCode: 500 }
  }
}

type GoogleWebAuthResponse = {
  redirectURL: string
  authToken?: string
  pendingUserAuth?: string
}

export async function handleGoogleWebAuth(
  idToken: string,
  isLocal = false,
  isVercel = false
): Promise<GoogleWebAuthResponse> {
  const baseURL = () => {
    if (isLocal) {
      return 'http://localhost:3000'
    }

    if (isVercel) {
      return homePageURL()
    }

    return env.client.url
  }

  const authFailedRedirect = `${baseURL()}/login?errorCodes=${
    LoginErrorCode.AuthFailed
  }`

  try {
    const loginTicket = await googleWebClient.verifyIdToken({
      idToken,
      audience: env.google.auth.clientId,
    })

    const email = loginTicket.getPayload()?.email
    const sourceUserId = loginTicket.getUserId() || undefined

    if (!email) {
      return Promise.resolve({
        redirectURL: authFailedRedirect,
      })
    }
    const user = await userRepository.findOneBy({
      email,
      source: 'GOOGLE',
    })
    const userId = user?.id

    if (!userId || !user?.profile) {
      logger.info('user or profile does not exist:', {
        sourceUserId,
        source: 'GOOGLE',
        email,
      })
      // User doesn't exist yet, so we return a pending user token
      // if user's profile doesn't exist, also send back to the profile creation
      const pendingUserAuth = await createPendingUserToken({
        email,
        sourceUserId: sourceUserId ?? '',
        provider: 'GOOGLE',
        name: '',
        username: '',
      })

      return {
        redirectURL: `${baseURL()}/confirm-profile`,
        pendingUserAuth,
      }
    }

    let redirectURL = `${baseURL()}${
      user.status === StatusType.Archived
        ? ARCHIVE_ACCOUNT_PATH
        : DEFAULT_HOME_PATH
    }`

    const authToken = await createWebAuthToken(userId)
    if (authToken) {
      if (isVercel) {
        const ssoToken = createSsoToken(authToken, redirectURL)
        redirectURL = ssoRedirectURL(ssoToken)
      }

      return {
        authToken,
        redirectURL,
      }
    } else {
      return { redirectURL: authFailedRedirect }
    }
  } catch (e) {
    logger.info('handleGoogleWebAuth error', e)
    return { redirectURL: authFailedRedirect }
  }
}
