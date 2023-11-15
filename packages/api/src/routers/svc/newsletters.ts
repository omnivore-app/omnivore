import express from 'express'
import { SubscriptionStatus } from '../../generated/graphql'
import { readPushSubscription } from '../../pubsub'
import {
  findNewsletterEmailByAddress,
  updateConfirmationCode,
} from '../../services/newsletters'
import { updateReceivedEmail } from '../../services/received_emails'
import {
  NewsletterMessage,
  saveNewsletter,
} from '../../services/save_newsletter_email'
import { saveUrlFromEmail } from '../../services/save_url'
import { getSubscriptionByName } from '../../services/subscriptions'
import { isUrl } from '../../utils/helpers'
import { logger } from '../../utils/logger'

interface SetConfirmationCodeMessage {
  emailAddress: string
  confirmationCode: string
}

const isNewsletterMessage = (data: any): data is NewsletterMessage => {
  return (
    'email' in data &&
    'title' in data &&
    'author' in data &&
    'url' in data &&
    'receivedEmailId' in data
  )
}

export function newsletterServiceRouter() {
  const router = express.Router()

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  router.post('/confirmation', async (req, res) => {
    logger.info('setConfirmationCode')

    const { message, expired } = readPushSubscription(req)
    logger.info('pubsub message', { message, expired })

    if (!message) {
      res.status(400).send('Bad Request')
      return
    }

    if (expired) {
      logger.info(`discards expired message: ${message}`)
      res.status(200).send('Expired')
      return
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const data: SetConfirmationCodeMessage = JSON.parse(message)

      if (!('emailAddress' in data) || !('confirmationCode' in data)) {
        logger.info('No email address or confirmation code found in message')
        res.status(400).send('Bad Request')
        return
      }

      const result = await updateConfirmationCode(
        data.emailAddress,
        data.confirmationCode
      )
      if (!result) {
        logger.info(`Newsletter email not found: ${data.emailAddress}`)
        res.status(200).send('Not Found')
        return
      }

      res.status(200).send('confirmation code set')
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

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  router.post('/create', async (req, res) => {
    logger.info('create newsletter in the library')

    try {
      const { message, expired } = readPushSubscription(req)
      if (!message) {
        return res.status(200).send('Bad Request')
      }

      if (expired) {
        logger.info('discards expired message', { message })
        return res.status(200).send('Expired')
      }

      const data = JSON.parse(message) as unknown
      if (!isNewsletterMessage(data)) {
        logger.error('invalid newsletter message', { data })
        return res.status(200).send('Invalid Message')
      }

      // get user from newsletter email
      const newsletterEmail = await findNewsletterEmailByAddress(data.email)
      if (!newsletterEmail) {
        logger.info(`newsletter email not found: ${data.email}`)
        return res.status(200).send('Not Found')
      }

      if (isUrl(data.title)) {
        // save url if the title is a parsable url
        const result = await saveUrlFromEmail(
          data.title,
          data.receivedEmailId,
          newsletterEmail.user.id
        )
        if (!result) {
          return res.status(500).send('Error saving url from email')
        }
      } else {
        // do not subscribe if subscription already exists and is unsubscribed
        const existingSubscription = await getSubscriptionByName(
          data.author,
          newsletterEmail.user.id
        )
        if (existingSubscription?.status === SubscriptionStatus.Unsubscribed) {
          logger.info(`newsletter already unsubscribed: ${data.author}`)
          return res.status(200).send('newsletter already unsubscribed')
        }

        // save newsletter instead
        const result = await saveNewsletter(data, newsletterEmail)
        if (!result) {
          logger.info('Error creating newsletter link from data', data)

          return res.status(500).send('Error creating newsletter link')
        }
      }

      // update received email type
      await updateReceivedEmail(
        data.receivedEmailId,
        'article',
        newsletterEmail.user.id
      )
    } catch (e) {
      logger.error(e)
      if (e instanceof SyntaxError) {
        // when message is not a valid json string
        return res.status(400).send(e)
      }

      return res.status(500).send(e)
    }

    res.status(200).send('newsletter created')
  })

  return router
}
