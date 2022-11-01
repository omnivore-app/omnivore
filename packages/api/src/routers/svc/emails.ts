import express from 'express'
import {
  createPubSubClient,
  readPushSubscription,
} from '../../datalayer/pubsub'
import { sendEmail } from '../../utils/sendEmail'
import { analytics } from '../../utils/analytics'
import { getNewsletterEmail } from '../../services/newsletters'
import { env } from '../../env'
import {
  generateUniqueUrl,
  getTitleFromEmailSubject,
  isProbablyArticle,
  parseEmailAddress,
} from '../../utils/parser'
import { saveEmail } from '../../services/save_email'
import { buildLogger } from '../../utils/logger'

interface ForwardEmailMessage {
  from: string
  to: string
  subject: string
  html: string
  unsubMailTo?: string
  unsubHttpUrl?: string
  text: string
  forwardedFrom?: string
}

const logger = buildLogger('app.dispatch')

export function emailsServiceRouter() {
  const router = express.Router()

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  router.post('/forward', async (req, res) => {
    logger.info('email forward router')

    const { message, expired } = readPushSubscription(req)
    logger.info('pubsub message:', { message, expired })

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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const data: ForwardEmailMessage = JSON.parse(message)

      if (
        !('from' in data) ||
        !('to' in data) ||
        !('subject' in data) ||
        (!('html' in data) && !('text' in data))
      ) {
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
        logger.error('Email not forwarded')
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

  return router
}
