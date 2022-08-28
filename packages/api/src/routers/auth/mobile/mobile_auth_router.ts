/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import express from 'express'
import {
  createMobileSignInResponse,
  createMobileEmailSignInResponse,
} from './sign_in'
import {
  createMobileSignUpResponse,
  createMobileEmailSignUpResponse,
} from './sign_up'
import { createMobileAccountCreationResponse } from './account_creation'
import { env } from '../../../env'
import { corsConfig } from '../../../utils/corsConfig'
import cors from 'cors'

export function mobileAuthRouter() {
  const router = express.Router()

  router.post('/sign-in', async (req, res) => {
    const { token, provider, source } = req.body
    const isAndroid = source === 'ANDROID'
    const payload = await createMobileSignInResponse(isAndroid, token, provider)
    res.status(payload.statusCode).json(payload.json)
  })

  router.post('/email-sign-in', async (req, res) => {
    const { email, password } = req.body
    const payload = await createMobileEmailSignInResponse(email, password)
    res.status(payload.statusCode).json(payload.json)
  })

  router.post('/email-sign-up', async (req, res) => {
    const { email, password, username, name } = req.body
    const payload = await createMobileEmailSignUpResponse(
      email,
      password,
      username,
      name
    )
    res.status(payload.statusCode).json(payload.json)
  })

  router.post('/sign-up', async (req, res) => {
    const { token, provider, name, source } = req.body
    const isAndroid = source === 'ANDROID'
    const payload = await createMobileSignUpResponse(
      isAndroid,
      token,
      provider,
      name
    )
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

  // Required since this will be called from Android WebView
  router.options(
    '/android-apple-redirect',
    cors<express.Request>({ ...corsConfig, maxAge: 600 })
  )

  router.post('/android-apple-redirect', (req, res) => {
    const { id_token } = req.body
    return res.redirect(
      `${env.client.url}/android-apple-token?token=${id_token as string}`
    )
  })

  return router
}
