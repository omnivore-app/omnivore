import { MulticastMessage } from 'firebase-admin/messaging'
import { createPubSubClient } from '../datalayer/pubsub'
import { UserDeviceToken } from '../entity/user_device_tokens'
import { env } from '../env'
import { ContentReader } from '../generated/graphql'
import { analytics } from '../utils/analytics'
import { sendMulticastPushNotifications } from '../utils/sendNotification'
import { getNewsletterEmail } from './newsletters'
import { SaveContext, saveEmail, SaveEmailInput } from './save_email'
import { getDeviceTokensByUserId } from './user_device_tokens'
import { Page } from '../elastic/types'
import { addLabelToPage } from './labels'
import { saveSubscription } from './subscriptions'
import { NewsletterEmail } from '../entity/newsletter_email'

interface NewsletterMessage {
  email: string
  content: string
  url: string
  title: string
  author: string
  unsubMailTo?: string
  unsubHttpUrl?: string
  newsletterEmail?: NewsletterEmail
  icon?: string
}

// Returns true if the link was created successfully. Can still fail to
// send the push but that is ok and we wont retry in that case.
export const saveNewsletterEmail = async (
  data: NewsletterMessage,
  ctx?: SaveContext
): Promise<boolean> => {
  // get user from newsletter email
  const newsletterEmail =
    data.newsletterEmail || (await getNewsletterEmail(data.email))
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
    console.log('newsletter not created:', input)
    return false
  }

  // creates or updates subscription
  const subscription = await saveSubscription({
    userId: newsletterEmail.user.id,
    name: data.author,
    newsletterEmail: newsletterEmail.address,
    unsubscribeMailTo: data.unsubMailTo,
    unsubscribeHttpUrl: data.unsubHttpUrl,
    icon: page.siteIcon,
  })
  console.log('subscription saved', subscription)

  // adds newsletters label to page
  const result = await addLabelToPage(saveCtx, page.id, {
    name: 'Newsletter',
    color: '#07D2D1',
  })
  console.log('newsletter label added:', result)

  // sends push notification
  const deviceTokens = await getDeviceTokensByUserId(newsletterEmail.user.id)
  if (!deviceTokens) {
    console.log('Device tokens not set:', newsletterEmail.user.id)
    return true
  }

  const multicastMessage = messageForLink(page, deviceTokens)
  await sendMulticastPushNotifications(
    newsletterEmail.user.id,
    multicastMessage,
    'newsletter'
  )

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
