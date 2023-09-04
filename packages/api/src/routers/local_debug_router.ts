import cors from 'cors'
import express, { Router } from 'express'
import { env } from '../env'
import { LoginErrorCode } from '../generated/graphql'
import { userRepository } from '../repository/user'
import { createUser } from '../services/create_user'
import { corsConfig } from '../utils/corsConfig'
import { createWebAuthToken } from './auth/jwt_helpers'

// For local development only
export function localDebugRouter(): Router {
  const router = express.Router()

  if (env.dev.isLocal) {
    router.post(
      '/fake-user-login',
      cors<express.Request>(corsConfig),
      async (req, res) => {
        const { fakeEmail } = req.body as { fakeEmail: string }

        try {
          let userId: string | undefined = undefined
          const existingUser = await userRepository.findOneBy({
            email: fakeEmail,
          })
          userId = existingUser?.id

          if (!userId) {
            const [newUser] = await createUser({
              provider: 'GOOGLE',
              sourceUserId: 'fake-user-id',
              email: fakeEmail,
              username: 'fakeuser',
              bio: 'i am a fake user',
              name: 'Fake User',
              inviteCode: 'aabbcc',
            })

            userId = newUser.id
          }

          if (!userId) {
            throw new Error('Failed to find or create user')
          }

          const authToken: string | undefined = await createWebAuthToken(userId)

          if (authToken) {
            res.cookie('auth', authToken, {
              httpOnly: false,
              maxAge: 365 * 24 * 60 * 60 * 1000,
              path: '/',
            })
            res.status(200).json({ authToken: authToken })
          } else {
            throw new Error('Failed to create auth token')
          }
        } catch {
          return res.redirect(
            `${env.client.url}/login?errorCodes=${LoginErrorCode.AuthFailed}`
          )
        }
      }
    )
  }

  return router
}
