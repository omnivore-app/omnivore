import express from 'express'
import {
  createPubSubClient,
  readPushSubscription,
} from '../../datalayer/pubsub'
import {
  getNewsletterEmail,
  updateConfirmationCode,
} from '../../services/newsletters'
import {
  SaveContext,
  saveEmail,
  SaveEmailInput,
} from '../../services/save_email'
import { initModels } from '../../server'
import { kx } from '../../datalayer/knex_config'
import { analytics } from '../../utils/analytics'
import { env } from '../../env'
import { sendMulticastPushNotifications } from '../../utils/sendNotification'
import { getDeviceTokensByUserId } from '../../services/user_device_tokens'
import { messaging } from 'firebase-admin'
import { ContentReader } from '../../generated/graphql'
import { UserDeviceToken } from '../../entity/user_device_tokens'
import { UserArticleData } from '../../datalayer/links/model'
import { ArticleData } from '../../datalayer/article/model'
import MulticastMessage = messaging.MulticastMessage

interface SetConfirmationCodeMessage {
  emailAddress: string
  confirmationCode: string
}

interface NewsletterMessage {
  email: string
  content: string
  url: string
  title: string
  author: string
}

export function newsletterServiceRouter() {
  const router = express.Router()

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  router.post('/confirmation', async (req, res) => {
    console.log('setConfirmationCode')

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
      const data: SetConfirmationCodeMessage = JSON.parse(message)

      if (!('emailAddress' in data) || !('confirmationCode' in data)) {
        console.log('No email address or confirmation code found in message')
        res.status(400).send('Bad Request')
        return
      }

      const result = await updateConfirmationCode(
        data.emailAddress,
        data.confirmationCode
      )
      if (!result) {
        console.log('Newsletter email not found', data.emailAddress)
        res.status(200).send('Not Found')
        return
      }

      res.status(200).send('confirmation code set')
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

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  router.post('/create', async (req, res) => {
    console.log('create')

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
      const data: NewsletterMessage = JSON.parse(message)

      if (
        !('email' in data) ||
        !('content' in data) ||
        !('url' in data) ||
        !('title' in data) ||
        !('author' in data)
      ) {
        console.log('invalid newsletter message', data)
        res.status(400).send('Bad Request')
        return
      }

      // get user from newsletter email
      const newsletterEmail = await getNewsletterEmail(data.email)

      if (!newsletterEmail) {
        console.log('newsletter email not found', data.email)
        res.status(200).send('Not Found')
        return
      }

      analytics.track({
        userId: newsletterEmail.user.id,
        event: 'newsletter_email_received',
        properties: {
          url: data.url,
          title: data.title,
          author: data.author,
          env: env.server.apiEnv,
        },
      })

      const ctx: SaveContext = {
        models: initModels(kx, false),
        pubsub: createPubSubClient(),
      }
      const input: SaveEmailInput = {
        url: data.url,
        originalContent: data.content,
        title: data.title,
        author: data.author,
      }

      const result = await saveEmail(ctx, newsletterEmail.user.id, input)
      if (!result) {
        console.log('newsletter not created:', input)
        res.status(200).send(result)
        return
      }

      // send push notification
      const deviceTokens = await getDeviceTokensByUserId(
        newsletterEmail.user.id
      )

      if (!deviceTokens) {
        console.log('Device tokens not set:', newsletterEmail.user.id)
        res.status(200).send('Device token Not Found')
        return
      }

      const link = await ctx.models.userArticle.getForUser(
        newsletterEmail.user.id,
        result.articleId
      )

      if (!link) {
        console.log(
          'Newsletter link not found:',
          newsletterEmail.user.id,
          result.articleId
        )
        res.status(200).send(result)
        return
      }

      if (deviceTokens.length) {
        const multicastMessage = messageForLink(link, deviceTokens)
        await sendMulticastPushNotifications(
          newsletterEmail.user.id,
          multicastMessage,
          'newsletter'
        )
      }

      res.status(200).send('newsletter created')
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

const messageForLink = (
  link: ArticleData & UserArticleData,
  deviceTokens: UserDeviceToken[]
): MulticastMessage => {
  let title = '📫 - An article was added to your Omnivore Inbox'

  if (link.author) {
    title = `📫 - ${link.author} has published a new article`
  }

  const pushData = !link
    ? undefined
    : {
        link: Buffer.from(
          JSON.stringify({
            id: link.id,
            url: link.url,
            slug: link.slug,
            title: link.title,
            image: link.image,
            author: link.author,
            isArchived: link.isArchived,
            contentReader: ContentReader.Web,
            readingProgressPercent: link.articleReadingProgress,
            readingProgressAnchorIndex: link.articleReadingProgressAnchorIndex,
          })
        ).toString('base64'),
      }

  return {
    notification: {
      title: title,
      body: link.title,
      imageUrl: link.image || undefined,
    },
    data: pushData,
    tokens: deviceTokens.map((token) => token.token),
  }
}
