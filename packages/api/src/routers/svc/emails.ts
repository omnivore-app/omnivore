import cors from 'cors'
import express from 'express'
import { env } from '../../env'
import { createPubSubClient, readPushSubscription } from '../../pubsub'
import { getNewsletterEmail } from '../../services/newsletters'
import {
  saveReceivedEmail,
  updateReceivedEmail,
} from '../../services/received_emails'
import { saveEmail } from '../../services/save_email'
import { analytics } from '../../utils/analytics'
import { getClaimsByToken } from '../../utils/auth'
import { corsConfig } from '../../utils/corsConfig'
import { logger } from '../../utils/logger'
import {
  generateUniqueUrl,
  getTitleFromEmailSubject,
  isProbablyArticle,
  parseEmailAddress,
} from '../../utils/parser'
import { sendEmail } from '../../utils/sendEmail'

interface EmailMessage {
  from: string
  to: string
  subject: string
  html: string
  unsubMailTo?: string
  unsubHttpUrl?: string
  text: string
  forwardedFrom?: string
  receivedEmailId: string
}

function isEmailMessage(data: any): data is EmailMessage {
  return 'from' in data && 'to' in data
}

export function emailsServiceRouter() {
  const router = express.Router()

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  router.post('/forward', async (req, res) => {
    logger.info('email forward router')

    const { message, expired } = readPushSubscription(req)

    if (!message) {
      res.status(400).send('Bad Request')
      return
    }

    if (expired) {
      logger.info('discards expired message.')
      res.status(200).send('Expired')
      return
    }

    try {
      const data = JSON.parse(message) as unknown
      if (!isEmailMessage(data)) {
        logger.error('Invalid message')
        res.status(400).send('Bad Request')
        return
      }

      // get user from newsletter email
      const newsletterEmail = await getNewsletterEmail(data.to)

      if (!newsletterEmail) {
        logger.info('newsletter email not found', { email: data.to })
        res.status(200).send('Not Found')
        return
      }
      const user = newsletterEmail.user
      const ctx = { pubsub: createPubSubClient(), uid: user.id }
      const parsedFrom = parseEmailAddress(data.from)

      if (
        await isProbablyArticle(
          data.forwardedFrom || parsedFrom.address,
          data.subject
        )
      ) {
        logger.info('handling as article')
        await saveEmail(ctx, {
          title: getTitleFromEmailSubject(data.subject),
          author: parsedFrom.name,
          url: generateUniqueUrl(),
          originalContent: data.html || data.text,
        })

        // update received email type
        await updateReceivedEmail(data.receivedEmailId, 'article')

        res.status(200).send('Article')
        return
      }

      analytics.track({
        userId: user.id,
        event: 'non_newsletter_email_received',
        properties: {
          env: env.server.apiEnv,
        },
      })

      // forward non-newsletter emails to the registered email address
      const result = await sendEmail({
        from: env.sender.message,
        to: user.email,
        subject: `Fwd: ${data.subject}`,
        html: data.html,
        text: data.text,
        replyTo: data.from,
      })

      if (!result) {
        logger.error('Email not forwarded: ', { to: user.email })
        res.status(500).send('Failed to send email')
        return
      }

      res.status(200).send('Email forwarded')
    } catch (e) {
      logger.info(e)
      if (e instanceof SyntaxError) {
        // when message is not a valid json string
        res.status(400).send(e)
      } else {
        res.status(500).send(e)
      }
    }
  })

  router.post('/save', cors<express.Request>(corsConfig), async (req, res) => {
    logger.info('save received email router')

    const token = req?.headers?.authorization
    if (!(await getClaimsByToken(token))) {
      return res.status(401).send('UNAUTHORIZED')
    }

    if (!isEmailMessage(req.body)) {
      logger.error('Invalid message')
      return res.status(400).send('Bad Request')
    }

    try {
      // get user from newsletter email
      const newsletterEmail = await getNewsletterEmail(req.body.to)

      if (!newsletterEmail) {
        logger.info('newsletter email not found', { email: req.body.to })
        res.status(200).send('Not Found')
        return
      }

      const user = newsletterEmail.user
      const receivedEmail = await saveReceivedEmail(
        req.body.from,
        newsletterEmail.address,
        req.body.subject,
        req.body.text,
        req.body.html,
        user.id
      )

      analytics.track({
        userId: user.id,
        event: 'received_email_saved',
        properties: {
          env: env.server.apiEnv,
        },
      })

      res.status(200).send({ id: receivedEmail.id })
    } catch (e) {
      logger.info(e)

      res.status(500).send(e)
    }
  })

  return router
}
