import { NewsletterEmail } from '../entity/newsletter_email'
import { env } from '../env'
import { analytics } from '../utils/analytics'
import { logger } from '../utils/logger'
import { saveEmail, SaveEmailInput } from './save_email'

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
  newsletterEmail: NewsletterEmail
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
  }
  const savedLibraryItem = await saveEmail(input)
  if (!savedLibraryItem) {
    logger.info('newsletter not created:', input.title)

    return false
  }

  // sends push notification
  // const deviceTokens = await getDeviceTokensByUserId(newsletterEmail.user.id)
  // if (!deviceTokens) {
  //   logger.info('Device tokens not set:', newsletterEmail.user.id)
  //   return true
  // }

  // const multicastMessage = messageForLink(page, deviceTokens)
  // await sendMulticastPushNotifications(
  //   newsletterEmail.user.id,
  //   multicastMessage,
  //   'newsletter'
  // )

  return true
}

// const messageForLink = (
//   link: Page,
//   deviceTokens: UserDeviceToken[]
// ): MulticastMessage => {
//   let title = '📫 - An article was added to your Omnivore Inbox'

//   if (link.author) {
//     title = `📫 - ${link.author} has published a new article`
//   }

//   const pushData = !link
//     ? undefined
//     : {
//         link: Buffer.from(
//           JSON.stringify({
//             id: link.id,
//             url: link.url,
//             slug: link.slug,
//             title: link.title,
//             image: link.image,
//             author: link.author,
//             isArchived: !!link.archivedAt,
//             contentReader: ContentReader.Web,
//             readingProgressPercent: link.readingProgressPercent,
//             readingProgressAnchorIndex: link.readingProgressAnchorIndex,
//           })
//         ).toString('base64'),
//       }

//   return {
//     notification: {
//       title: title,
//       body: link.title,
//       imageUrl: link.image || undefined,
//     },
//     data: pushData,
//     tokens: deviceTokens.map((token) => token.token),
//   }
// }
