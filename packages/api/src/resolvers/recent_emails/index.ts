import {
  MarkEmailAsItemError,
  MarkEmailAsItemErrorCode,
  MarkEmailAsItemSuccess,
  MutationMarkEmailAsItemArgs,
  RecentEmailsError,
  RecentEmailsErrorCode,
  RecentEmailsSuccess,
} from '../../generated/graphql'
import { authorized } from '../../utils/helpers'
import { getRepository } from '../../entity/utils'
import { ReceivedEmail } from '../../entity/received_email'
import { saveNewsletterEmail } from '../../services/save_newsletter_email'
import { NewsletterEmail } from '../../entity/newsletter_email'
import { generateUniqueUrl, parseEmailAddress } from '../../utils/parser'

export const recentEmailsResolver = authorized<
  RecentEmailsSuccess,
  RecentEmailsError
>(async (_, __, { claims, log }) => {
  log.info('Getting recent emails', {
    labels: {
      source: 'resolver',
      resolver: 'recentEmailsResolver',
      uid: claims.uid,
    },
  })

  try {
    const recentEmails = await getRepository(ReceivedEmail).find({
      where: { user: { id: claims.uid } },
      order: { createdAt: 'DESC' },
      take: 20,
    })

    return {
      recentEmails,
    }
  } catch (error) {
    log.error('Error getting recent emails', {
      error,
      labels: {
        source: 'resolver',
        resolver: 'recentEmailsResolver',
        uid: claims.uid,
      },
    })

    return {
      errorCodes: [RecentEmailsErrorCode.BadRequest],
    }
  }
})

export const markEmailAsItemResolver = authorized<
  MarkEmailAsItemSuccess,
  MarkEmailAsItemError,
  MutationMarkEmailAsItemArgs
>(async (_, { recentEmailId }, { claims, log }) => {
  log.info('Marking email as item', {
    recentEmailId,
    labels: {
      source: 'resolver',
      resolver: 'markEmailAsItemResolver',
      uid: claims.uid,
    },
  })

  try {
    const recentEmail = await getRepository(ReceivedEmail).findOneBy({
      id: recentEmailId,
      user: { id: claims.uid },
    })
    if (!recentEmail) {
      return {
        errorCodes: [MarkEmailAsItemErrorCode.Unauthorized],
      }
    }

    const newsletterEmail = await getRepository(NewsletterEmail).findOneBy({
      address: recentEmail.to,
      user: { id: claims.uid },
    })
    if (!newsletterEmail) {
      return {
        errorCodes: [MarkEmailAsItemErrorCode.NotFound],
      }
    }

    const success = await saveNewsletterEmail(
      {
        from: recentEmail.from,
        email: recentEmail.to,
        title: recentEmail.subject,
        text: recentEmail.text,
        content: recentEmail.html,
        url: generateUniqueUrl(),
        author: parseEmailAddress(recentEmail.from).name,
        receivedEmailId: recentEmail.id,
      },
      newsletterEmail
    )

    return {
      success,
    }
  } catch (error) {
    log.error('Error marking email as item', {
      error,
      labels: {
        source: 'resolver',
        resolver: 'markEmailAsItemResolver',
        uid: claims.uid,
      },
    })

    return {
      errorCodes: [MarkEmailAsItemErrorCode.BadRequest],
    }
  }
})
