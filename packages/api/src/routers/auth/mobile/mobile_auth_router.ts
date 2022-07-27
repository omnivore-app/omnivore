/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import express from 'express'
import {
  createMobileSignInResponse,
  createMobileEmailSignInResponse,
} from './sign_in'
import { createMobileSignUpResponse } from './sign_up'
import { createMobileAccountCreationResponse } from './account_creation'

export function mobileAuthRouter() {
  const router = express.Router()

  router.post('/sign-in', async (req, res) => {
    const { token, provider } = req.body
    const payload = await createMobileSignInResponse(token, provider)
    res.status(payload.statusCode).json(payload.json)
  })

  router.post('/email-sign-in', async (req, res) => {
    const { email, password } = req.body
    const payload = await createMobileEmailSignInResponse(email, password)
    res.status(payload.statusCode).json(payload.json)
  })

  router.post('/sign-up', async (req, res) => {
    const { token, provider, name } = req.body
    const payload = await createMobileSignUpResponse(token, provider, name)
    res.status(payload.statusCode).json(payload.json)
  })

  router.post('/create-account', async (req, res) => {
    const { pendingUserToken, userProfile } = req.body
    const payload = await createMobileAccountCreationResponse(
      pendingUserToken,
      userProfile
    )
    res.status(payload.statusCode).json(payload.json)
  })

  return router
}
