import { MulticastMessage } from 'firebase-admin/messaging'
import { kx } from '../datalayer/knex_config'
import { createPubSubClient } from '../datalayer/pubsub'
import { UserDeviceToken } from '../entity/user_device_tokens'
import { env } from '../env'
import { ContentReader } from '../generated/graphql'
import { initModels } from '../server'
import { analytics } from '../utils/analytics'
import { sendMulticastPushNotifications } from '../utils/sendNotification'
import { getNewsletterEmail } from './newsletters'
import { SaveContext, saveEmail, SaveEmailInput } from './save_email'
import { getDeviceTokensByUserId } from './user_device_tokens'
import { getPageByParam } from '../elastic'
import { Page } from '../elastic/types'

interface NewsletterMessage {
  email: string
  content: string
  url: string
  title: string
  author: string
}

// Returns true if the link was created successfully. Can still fail to
// send the push but that is ok and we wont retry in that case.
export const saveNewsletterEmail = async (
  data: NewsletterMessage
): Promise<boolean> => {
  // get user from newsletter email
  const newsletterEmail = await getNewsletterEmail(data.email)

  if (!newsletterEmail) {
    console.log('newsletter email not found', data.email)
    return false
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
    return false
  }

  // send push notification
  const deviceTokens = await getDeviceTokensByUserId(newsletterEmail.user.id)

  if (!deviceTokens) {
    console.log('Device tokens not set:', newsletterEmail.user.id)
    return true
  }

  const link = await getPageByParam({
    _id: result.articleId,
    userId: newsletterEmail.user.id,
  })

  if (!link) {
    console.log(
      'Newsletter link not found:',
      newsletterEmail.user.id,
      result.articleId
    )
    return true
  }

  if (deviceTokens.length) {
    const multicastMessage = messageForLink(link, deviceTokens)
    await sendMulticastPushNotifications(
      newsletterEmail.user.id,
      multicastMessage,
      'newsletter'
    )
  }

  return true
}

const messageForLink = (
  link: Page,
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
            isArchived: !!link.archivedAt,
            contentReader: ContentReader.Web,
            readingProgressPercent: link.readingProgressPercent,
            readingProgressAnchorIndex: link.readingProgressAnchorIndex,
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
