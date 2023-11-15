/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import cors from 'cors'
import express from 'express'
import { env } from '../env'
import { userRepository } from '../repository/user'
import { getClaimsByToken, getTokenByRequest } from '../utils/auth'
import { corsConfig } from '../utils/corsConfig'
import { logger } from '../utils/logger'
import { sendEmail } from '../utils/sendEmail'

export function userRouter() {
  const router = express.Router()

  router.post('/email', cors<express.Request>(corsConfig), async (req, res) => {
    logger.info('email to-user router')
    const token = getTokenByRequest(req)

    let claims
    try {
      claims = await getClaimsByToken(token)
      if (!claims) {
        logger.info('failed to authorize')
        return res.status(401).send('UNAUTHORIZED')
      }
    } catch (e) {
      logger.info('failed to authorize', e)
      return res.status(401).send('UNAUTHORIZED')
    }

    const from = env.sender.message
    const { body, subject } = req.body as {
      body?: string
      subject?: string
    }
    if (!subject || !body || !from) {
      logger.error('Bad Request', { subject, body, from })
      res.status(400).send('Bad Request')
      return
    }
    try {
      const user = await userRepository.findById(claims.uid)
      if (!user) {
        res.status(400).send('Bad Request')
        return
      }
      const result = await sendEmail({
        from: env.sender.message,
        to: user.email,
        subject: subject,
        text: body,
      })
      if (!result) {
        logger.error('Email not sent to user')
        res.status(500).send('Failed to send email')
        return
      }
      res.status(200).send('Email sent to user')
    } catch (e) {
      logger.info(e)
      res.status(500).send('Email sent to user')
    }
  })

  return router
}
