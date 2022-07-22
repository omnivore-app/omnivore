/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import {
  generateGoogleLoginURL,
  googleAuth,
  handleGoogleWebAuth,
  validateGoogleUser,
} from './google_auth'

import type { Request, Response } from 'express'
import express from 'express'
import axios from 'axios'
import { env } from '../../env'
import url from 'url'
import { IntercomClient } from '../../utils/intercom'
import { kx } from '../../datalayer/knex_config'
import UserModel from '../../datalayer/user'
import { buildLogger } from '../../utils/logger'
import { promisify } from 'util'
import * as jwt from 'jsonwebtoken'
import { LoginErrorCode, SignupErrorCode } from '../../generated/graphql'
import { handleAppleWebAuth } from './apple_auth'
import type { AuthProvider } from './auth_types'
import { createMobileAccountCreationResponse } from './mobile/account_creation'
import { corsConfig } from '../../utils/corsConfig'
import cors from 'cors'

import {
  RegistrationType,
  StatusType,
  UserData,
} from '../../datalayer/user/model'
import {
  comparePassword,
  getClaimsByToken,
  hashPassword,
} from '../../utils/auth'
import { createUser, sendConfirmationEmail } from '../../services/create_user'
import { isErrorWithCode } from '../../resolvers'
import { initModels } from '../../server'
import { getRepository } from '../../entity/utils'
import { User } from '../../entity/user'

const logger = buildLogger('app.dispatch')
const signToken = promisify(jwt.sign)

const cookieParams = {
  httpOnly: true,
  maxAge: 365 * 24 * 60 * 60 * 1000,
}

export function authRouter() {
  const router = express.Router()

  router.post('/apple-redirect', curriedAuthHandler('APPLE', false))
  router.post('/gauth-redirect', curriedAuthHandler('GOOGLE', false))
  router.post(
    '/vercel/apple-redirect',
    curriedAuthHandler('APPLE', false, true)
  )
  router.post(
    '/vercel/gauth-redirect',
    curriedAuthHandler('GOOGLE', false, true)
  )
  router.post(
    '/apple-redirect-localhost',
    curriedAuthHandler('APPLE', true, true)
  )
  router.post(
    '/gauth-redirect-localhost',
    curriedAuthHandler('GOOGLE', true, true)
  )

  router.options(
    '/create-account',
    cors<express.Request>({ ...corsConfig, maxAge: 600 })
  )
  router.post(
    '/create-account',
    cors<express.Request>(corsConfig),
    async (req, res) => {
      const { name, bio, username } = req.body

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const token = req.cookies?.pendingUserAuth as string | undefined

      const payload = await createMobileAccountCreationResponse(token, {
        name,
        username,
        bio,
      })

      if (payload.json.authToken) {
        res.cookie('auth', payload.json.authToken, cookieParams)
        res.clearCookie('pendingUserAuth')
      }

      res.status(payload.statusCode).json({})
    }
  )

  function curriedAuthHandler(
    provider: AuthProvider,
    isLocal: boolean,
    isVercel = false
  ): (req: Request, res: Response) => void {
    return (req: Request, res: Response) =>
      authHandler(req, res, provider, isLocal, isVercel)
  }

  async function authHandler(
    req: Request,
    res: Response,
    provider: AuthProvider,
    isLocal: boolean,
    isVercel: boolean
  ) {
    const completion = (
      res: Response,
      redirectURL: string,
      jwt?: string,
      pendingUserJwt?: string
    ) => {
      if (jwt) {
        res.cookie('auth', jwt, cookieParams)
      }

      if (pendingUserJwt) {
        res.cookie('pendingUserAuth', pendingUserJwt, cookieParams)
      }

      return res.redirect(redirectURL)
    }

    if (provider === 'APPLE') {
      const { id_token, user } = req.body
      const authResponse = await handleAppleWebAuth(
        id_token,
        user,
        isLocal,
        isVercel
      )
      completion(
        res,
        authResponse.redirectURL,
        authResponse.authToken,
        authResponse.pendingUserToken
      )
      return
    }

    if (provider === 'GOOGLE') {
      const { credential } = req.body
      const authResponse = await handleGoogleWebAuth(
        credential,
        isLocal,
        isVercel
      )
      completion(
        res,
        authResponse.redirectURL,
        authResponse.authToken,
        authResponse.pendingUserAuth
      )
      return
    }

    res.status(500).send('Unknown provider')
  }

  router.options(
    '/verify',
    cors<express.Request>({ ...corsConfig, maxAge: 600 })
  )
  router.get('/verify', cors<express.Request>(corsConfig), async (req, res) => {
    // return 'AUTHENTICATED', 'PENDING_USER', or 'NOT_AUTHENTICATED'

    if (req.cookies?.auth || req.headers['authorization']) {
      res.status(200).json({ authStatus: 'AUTHENTICATED' })
    } else if (req.cookies?.pendingUserAuth || req.headers['pendingUserAuth']) {
      res.status(200).json({ authStatus: 'PENDING_USER' })
    } else {
      res.status(200).json({ authStatus: 'NOT_AUTHENTICATED' })
    }
  })

  // Remove code below this line once we update google auth to new version

  router.get('/google-redirect/login', async (req, res) => {
    let redirect_uri = ''
    if (req.query.redirect_uri) {
      redirect_uri = encodeURIComponent(req.query.redirect_uri as string)
    }
    const state = JSON.stringify({ redirect_uri })
    res.redirect(
      generateGoogleLoginURL(
        googleAuth(),
        `/api/auth/google-login/login`,
        state
      )
    )
  })

  router.get('/google-login/login', async (req, res) => {
    const { code } = req.query

    const userData = await validateGoogleUser(`${code}`)

    if (!userData || !userData.email || !userData.id) {
      return { errorCodes: [SignupErrorCode.GoogleAuthError] }
    }

    const model = new UserModel(kx)
    const user = await model.getWhere({ email: userData.email })

    // eslint-disable-next @typescript-eslint/ban-ts-comment
    const secret = (await signToken(
      { email: userData.email },
      env.server.jwtSecret,
      // @ts-ignore
      {
        expiresIn: 300,
      }
    )) as string

    if (!user) {
      return res.redirect(
        `${env.client.url}/join?email=${userData.email}&name=${userData.name}&sourceUserId=${userData.id}&pictureUrl=${userData.picture}&secret=${secret}`
      )
    }

    if (user.source !== RegistrationType.Google) {
      const errorCodes = [LoginErrorCode.WrongSource]
      return res.redirect(
        `${env.client.url}/${
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (req.params as any)?.action
        }?errorCodes=${errorCodes}`
      )
    }

    const query = `
    mutation googleLogin{
      googleLogin(input: {
        secret: "${secret}",
        email: "${userData.email}",
      }) {
        __typename
        ... on LoginError { errorCodes }
        ... on LoginSuccess {
          me {
            id
            name
            profile {
              pictureUrl
            }
          }
        }
      }
    }`

    const result = await axios.post(env.server.gateway_url + '/graphql', {
      query,
    })
    const { data } = result.data

    if (data.googleLogin.__typename === 'LoginError') {
      if (data.googleLogin.errorCodes.includes(LoginErrorCode.UserNotFound)) {
        return res.redirect(`${env.client.url}/login`)
      }

      const errorCodes = data.googleLogin.errorCodes.join(',')
      return res.redirect(
        `${env.client.url}/${
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (req.params as any)?.action
        }?errorCodes=${errorCodes}`
      )
    }

    if (!result.headers['set-cookie']) {
      return res.redirect(
        `${env.client.url}/${
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (req.params as any)?.action
        }?errorCodes=unknown`
      )
    }

    res.setHeader('set-cookie', result.headers['set-cookie'])

    await handleSuccessfulLogin(req, res, user, data.googleLogin.newUser)
  })

  async function handleSuccessfulLogin(
    req: express.Request,
    res: express.Response,
    user: UserData,
    newUser: boolean
  ): Promise<void> {
    try {
      const redirect = (res: express.Response): void => {
        let redirectUri: string | null = null
        if (req.query.state) {
          // Google login case: redirect_uri is in query state param.
          try {
            const state = JSON.parse((req.query?.state || '') as string)
            redirectUri = state?.redirect_uri
          } catch (err) {
            console.warn(
              'handleSuccessfulLogin: failed to parse redirect query state param',
              err
            )
          }
        }

        if (newUser) {
          if (redirectUri && redirectUri !== '/') {
            return res.redirect(
              url.resolve(env.client.url, decodeURIComponent(redirectUri))
            )
          }
          return res.redirect(
            `${env.client.url}/settings/installation/extensions`
          )
        }

        return res.redirect(
          url.resolve(env.client.url, decodeURIComponent(redirectUri || 'home'))
        )
      }

      if (env.server.apiEnv && !env.dev.isLocal && IntercomClient) {
        if (newUser) {
          redirect(res)
        } else {
          redirect(res)
        }
      } else {
        redirect(res)
      }
    } catch (error) {
      logger.info('handleSuccessfulLogin exception:', error)
      return res.redirect(`${env.client.url}/login?errorCodes=AUTH_FAILED`)
    }
  }

  router.options(
    '/email-login',
    cors<express.Request>({ ...corsConfig, maxAge: 600 })
  )

  router.post(
    '/email-login',
    cors<express.Request>(corsConfig),
    async (req: express.Request, res: express.Response) => {
      const { email, password } = req.body

      try {
        const models = initModels(kx, false)
        const user = await models.user.getWhere({
          email,
        })
        if (!user?.id) {
          return res.redirect(
            `${env.client.url}/email-login?errorCodes=${LoginErrorCode.UserNotFound}`
          )
        }

        if (user.status === StatusType.Pending && user.email) {
          await sendConfirmationEmail({
            id: user.id,
            email: user.email,
            name: user.name,
          })
          return res.redirect(
            `${env.client.url}/email-login?errorCodes=PENDING_VERIFICATION`
          )
        }

        if (!user?.password) {
          // user has no password, so they need to set one
          return res.redirect(
            `${env.client.url}/email-login?errorCodes=${LoginErrorCode.WrongSource}`
          )
        }

        // check if password is correct
        const validPassword = await comparePassword(password, user.password)
        if (!validPassword) {
          return res.redirect(
            `${env.client.url}/email-login?errorCodes=${LoginErrorCode.InvalidCredentials}`
          )
        }

        // set auth cookie in response header
        const token = await signToken({ uid: user.id }, env.server.jwtSecret)

        res.cookie('auth', token, {
          httpOnly: true,
          expires: new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000),
        })

        await handleSuccessfulLogin(req, res, user, false)
      } catch (e) {
        logger.info('email-login exception:', e)
        res.redirect(`${env.client.url}/email-login?errorCodes=AUTH_FAILED`)
      }
    }
  )

  router.options(
    '/email-signup',
    cors<express.Request>({ ...corsConfig, maxAge: 600 })
  )

  router.post(
    '/email-signup',
    cors<express.Request>(corsConfig),
    async (req: express.Request, res: express.Response) => {
      const { email, password, name, username, bio, pictureUrl } = req.body
      const lowerCasedUsername = username.toLowerCase()

      try {
        // hash password
        const hashedPassword = await hashPassword(password)

        await createUser({
          email,
          provider: 'EMAIL',
          sourceUserId: email,
          name,
          username: lowerCasedUsername,
          pictureUrl,
          bio,
          password: hashedPassword,
          pendingConfirmation: true,
        })

        res.redirect(`${env.client.url}/email-login?message=SIGNUP_SUCCESS`)
      } catch (e) {
        logger.info('email-signup exception:', e)
        if (isErrorWithCode(e)) {
          return res.redirect(
            `${env.client.url}/email-signup?errorCodes=${e.errorCode}`
          )
        }
        res.redirect(`${env.client.url}/email-signup?errorCodes=UNKNOWN`)
      }
    }
  )

  router.options(
    '/confirm-email',
    cors<express.Request>({ ...corsConfig, maxAge: 600 })
  )

  router.post(
    '/confirm-email',
    cors<express.Request>(corsConfig),
    async (req: express.Request, res: express.Response) => {
      const token = req.body.token

      try {
        // verify token
        const claims = await getClaimsByToken(token)
        if (!claims) {
          return res.redirect(
            `${env.client.url}/confirm-email?errorCodes=INVALID_TOKEN`
          )
        }

        const user = await getRepository(User).findOneBy({ id: claims.uid })
        if (!user) {
          return res.redirect(
            `${env.client.url}/confirm-email?errorCodes=USER_NOT_FOUND`
          )
        }

        if (user.status === StatusType.Pending) {
          await getRepository(User).update(
            { id: user.id },
            { status: StatusType.Active }
          )
        }

        res.redirect(`${env.client.url}/email-login?message=EMAIL_VERIFIED`)
      } catch (e) {
        logger.info('confirm-email exception:', e)
        if (e instanceof jwt.TokenExpiredError) {
          return res.redirect(
            `${env.client.url}/confirm-email?errorCodes=TOKEN_EXPIRED`
          )
        }

        res.redirect(`${env.client.url}/confirm-email?errorCodes=INVALID_TOKEN`)
      }
    }
  )

  return router
}
