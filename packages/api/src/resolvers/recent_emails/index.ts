import { ILike } from 'typeorm'
import { getRepository } from '../../entity'
import { NewsletterEmail } from '../../entity/newsletter_email'
import { ReceivedEmail } from '../../entity/received_email'
import { env } from '../../env'
import {
  MarkEmailAsItemError,
  MarkEmailAsItemErrorCode,
  MarkEmailAsItemSuccess,
  MutationMarkEmailAsItemArgs,
  RecentEmailsError,
  RecentEmailsErrorCode,
  RecentEmailsSuccess,
} from '../../generated/graphql'
import { updateReceivedEmail } from '../../services/received_emails'
import { saveNewsletterEmail } from '../../services/save_newsletter_email'
import { authorized } from '../../utils/helpers'
import { generateUniqueUrl, parseEmailAddress } from '../../utils/parser'
import { sendEmail } from '../../utils/sendEmail'

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
      type: 'non-article',
    })
    if (!recentEmail) {
      log.info('no recent email', recentEmailId)

      return {
        errorCodes: [MarkEmailAsItemErrorCode.Unauthorized],
      }
    }

    const newsletterEmail = await getRepository(NewsletterEmail).findOne({
      where: {
        address: ILike(recentEmail.to),
        user: { id: claims.uid },
      },
      relations: ['user'],
    })
    if (!newsletterEmail) {
      log.info('no newsletter email for', {
        id: recentEmail.id,
        to: recentEmail.to,
        from: recentEmail.from,
      })

      return {
        errorCodes: [MarkEmailAsItemErrorCode.NotFound],
      }
    }

    const success = await saveNewsletterEmail(
      {
        from: recentEmail.from,
        email: recentEmail.to,
        title: recentEmail.subject,
        content: recentEmail.html,
        url: generateUniqueUrl(),
        author: parseEmailAddress(recentEmail.from).name,
        receivedEmailId: recentEmail.id,
      },
      newsletterEmail
    )
    if (!success) {
      log.info('newsletter not created', recentEmail.id)

      return {
        errorCodes: [MarkEmailAsItemErrorCode.BadRequest],
      }
    }

    // update received email type
    await updateReceivedEmail(recentEmail.id, 'article')

    const text = `A recent email marked as a library item
                    by: ${claims.uid}
                    from: ${recentEmail.from}
                    subject: ${recentEmail.subject}`

    // email us to let us know that an email failed to parse as an article
    await sendEmail({
      to: env.sender.feedback,
      subject: 'A recent email marked as a library item',
      text,
      from: env.sender.message,
    })

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
