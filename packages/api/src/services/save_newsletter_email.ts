import {
  EXISTING_NEWSLETTER_FOLDER,
  NewsletterEmail,
} from '../entity/newsletter_email'
import { Subscription } from '../entity/subscription'
import { env } from '../env'
import { analytics } from '../utils/analytics'
import { logger } from '../utils/logger'
import { saveEmail, SaveEmailInput } from './save_email'
import { getSubscriptionByName } from './subscriptions'

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
export const saveNewsletter = async (
  data: NewsletterMessage,
  newsletterEmail: NewsletterEmail,
  existingSubscription?: Subscription
): Promise<boolean> => {
  analytics.capture({
    distinctId: newsletterEmail.user.id,
    event: 'newsletter_email_received',
    properties: {
      url: data.url,
      title: data.title,
      author: data.author,
      env: env.server.apiEnv,
    },
  })

  if (!data.content) {
    logger.info(`newsletter not created, no content: ${data.email}`)
    return false
  }

  // find existing subscription if not provided
  if (!existingSubscription) {
    existingSubscription =
      (await getSubscriptionByName(data.author, newsletterEmail.user.id)) ||
      undefined
  }

  // subscription's folder takes precedence over newsletter email's folder
  const folder =
    existingSubscription?.folder ||
    newsletterEmail.folder ||
    EXISTING_NEWSLETTER_FOLDER

  const input: SaveEmailInput = {
    userId: newsletterEmail.user.id,
    url: data.url,
    originalContent: data.content,
    title: data.title,
    author: data.author,
    unsubMailTo: data.unsubMailTo,
    unsubHttpUrl: data.unsubHttpUrl,
    newsletterEmailId: newsletterEmail.id,
    receivedEmailId: data.receivedEmailId,
    folder,
  }
  const savedLibraryItem = await saveEmail(input)
  if (!savedLibraryItem) {
    logger.info(`newsletter not created: ${input.title}`)

    return false
  }

  return true
}
