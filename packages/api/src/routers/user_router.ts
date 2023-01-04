import express from 'express'
import { sendEmail } from '../utils/sendEmail'
import { env } from '../env'
import { buildLogger } from '../utils/logger'
import { getRepository } from '../entity/utils'
import { User } from '../entity/user'
import { getClaimsByToken } from '../utils/auth'

const logger = buildLogger('app.dispatch')

export function userRouter() {
  const router = express.Router()

  router.post('/email', async (req, res) => {
    logger.info('email to-user router')

    const token = req?.cookies?.auth || req?.headers?.authorization
    const claims = await getClaimsByToken(token)
    if (!claims) {
      res.status(401).send('UNAUTHORIZED')
      return
    }

    const from = process.env.SENDER_MESSAGE
    const { body, subject } = req.body as {
      body?: string
      subject?: string
    }

    if (!subject || !body || !from) {
      console.log(subject, body, from)
      res.status(400).send('Bad Request')
      return
    }

    try {
      const user = await getRepository(User).findOneBy({ id: claims.uid })
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
    }
  })

  return router
}
