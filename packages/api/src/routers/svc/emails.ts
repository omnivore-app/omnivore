import express from 'express'
import { readPushSubscription } from '../../datalayer/pubsub'
import { sendEmail } from '../../utils/sendEmail'
import { analytics } from '../../utils/analytics'
import { getNewsletterEmail } from '../../services/newsletters'
import { env } from '../../env'
import { isProbablyNewsletter } from '../../utils/parser'
import { saveNewsletterEmail } from '../../services/save_newsletter_email'

interface ForwardEmailMessage {
  from: string
  to: string
  subject: string
  html: string
}

export function emailsServiceRouter() {
  const router = express.Router()

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  router.post('/forward', async (req, res) => {
    console.log('forward')

    const { message, expired } = readPushSubscription(req)
    console.log('pubsub message:', message, 'expired:', expired)

    if (!message) {
      res.status(400).send('Bad Request')
      return
    }

    if (expired) {
      console.log('discards expired message:', message)
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
        !('html' in data)
      ) {
        console.log('Invalid message')
        res.status(400).send('Bad Request')
        return
      }

      if (isProbablyNewsletter(data.html)) {
        console.log('handling as newsletter', data)
        await saveNewsletterEmail({
          email: data.to,
          title: data.subject,
          content: data.html,
          author: data.from,
          url: 'https://omnivore.app/no_url',
        })
        res.status(200).send('Newsletter')
        return
      }

      // get user from newsletter email
      const newsletterEmail = await getNewsletterEmail(data.to)

      if (!newsletterEmail) {
        console.log('newsletter email not found', data.to)
        res.status(200).send('Not Found')
        return
      }

      analytics.track({
        userId: newsletterEmail.user.id,
        event: 'non_newsletter_email_received',
        properties: {
          env: env.server.apiEnv,
        },
      })

      // forward non-newsletter emails to the registered email address
      const result = await sendEmail({
        from: 'msgs@omnivore.app',
        to: newsletterEmail.user.email,
        subject: `Fwd: ${data.subject}`,
        html: data.html,
      })

      if (!result) {
        console.log('Email not forwarded', data)
        res.status(200).send('Failed to send email')
        return
      }

      res.status(200).send('Email forwarded')
    } catch (e) {
      console.log(e)
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
