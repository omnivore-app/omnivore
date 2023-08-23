import { MulticastMessage } from 'firebase-admin/messaging'
import { updatePage } from '../elastic/pages'
import { Page } from '../elastic/types'
import { NewsletterEmail } from '../entity/newsletter_email'
import { UserDeviceToken } from '../entity/user_device_tokens'
import { env } from '../env'
import { ContentReader } from '../generated/graphql'
import { createPubSubClient } from '../pubsub'
import { analytics } from '../utils/analytics'
import { isBase64Image } from '../utils/helpers'
import { logger } from '../utils/logger'
import { fetchFavicon } from '../utils/parser'
import { addLabelToPage } from './labels'
import { SaveContext, saveEmail, SaveEmailInput } from './save_email'
import { saveSubscription } from './subscriptions'
import { getDeviceTokensByUserId } from './user_device_tokens'

export interface NewsletterMessage {
  email: string
  url: string
  title: string
  author: string
  content?: string
  from?: string
  unsubMailTo?: string
  unsubHttpUrl?: string
  receivedEmailId: string
}

// Returns true if the link was created successfully. Can still fail to
// send the push but that is ok and we wont retry in that case.
export const saveNewsletterEmail = async (
  data: NewsletterMessage,
  newsletterEmail: NewsletterEmail,
  ctx?: SaveContext
): Promise<boolean> => {
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

  if (!data.content) {
    logger.info('newsletter not created, no content:', data.email)
    return false
  }

  const saveCtx = ctx || {
    pubsub: createPubSubClient(),
    uid: newsletterEmail.user.id,
  }
  const input: SaveEmailInput = {
    url: data.url,
    originalContent: data.content,
    title: data.title,
    author: data.author,
    unsubMailTo: data.unsubMailTo,
    unsubHttpUrl: data.unsubHttpUrl,
  }
  const page = await saveEmail(saveCtx, input)
  if (!page) {
    logger.info('newsletter not created:', input.title)

    return false
  }

  let icon = page.siteIcon
  if (!icon || isBase64Image(icon)) {
    // fetch favicon if not already set or is a base64 image
    icon = await fetchFavicon(page.url)
    if (icon) {
      await updatePage(page.id, { siteIcon: icon }, saveCtx)
    }
  }

  const subscriptionId = await saveSubscription({
    userId: newsletterEmail.user.id,
    name: data.author,
    newsletterEmail,
    unsubscribeMailTo: data.unsubMailTo,
    unsubscribeHttpUrl: data.unsubHttpUrl,
    icon,
  })
  logger.info('subscription saved', subscriptionId)

  // adds newsletters label to page
  const result = await addLabelToPage(saveCtx, page.id, {
    name: 'Newsletter',
    color: '#07D2D1',
  })

  logger.info('newsletter label added', { result })

  // sends push notification
  const deviceTokens = await getDeviceTokensByUserId(newsletterEmail.user.id)
  if (!deviceTokens) {
    logger.info('Device tokens not set:', newsletterEmail.user.id)
    return true
  }

  // const multicastMessage = messageForLink(page, deviceTokens)
  // await sendMulticastPushNotifications(
  //   newsletterEmail.user.id,
  //   multicastMessage,
  //   'newsletter'
  // )

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
