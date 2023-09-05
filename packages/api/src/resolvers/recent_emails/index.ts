import { ILike } from 'typeorm'
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
import { saveNewsletter } from '../../services/save_newsletter_email'
import { authorized } from '../../utils/helpers'
import { generateUniqueUrl, parseEmailAddress } from '../../utils/parser'
import { sendEmail } from '../../utils/sendEmail'

export const recentEmailsResolver = authorized<
  RecentEmailsSuccess,
  RecentEmailsError
>(async (_, __, { authTrx, log }) => {
  try {
    const recentEmails = await authTrx((t) =>
      t.getRepository(ReceivedEmail).find({
        order: { createdAt: 'DESC' },
        take: 20,
      })
    )

    return {
      recentEmails,
    }
  } catch (error) {
    log.error('Error getting recent emails', error)

    return {
      errorCodes: [RecentEmailsErrorCode.BadRequest],
    }
  }
})

export const markEmailAsItemResolver = authorized<
  MarkEmailAsItemSuccess,
  MarkEmailAsItemError,
  MutationMarkEmailAsItemArgs
>(async (_, { recentEmailId }, { authTrx, uid, log }) => {
  try {
    const recentEmail = await authTrx((t) =>
      t.getRepository(ReceivedEmail).findOneBy({
        id: recentEmailId,
        type: 'non-article',
      })
    )
    if (!recentEmail) {
      log.info('no recent email', recentEmailId)

      return {
        errorCodes: [MarkEmailAsItemErrorCode.Unauthorized],
      }
    }

    const newsletterEmail = await authTrx((t) =>
      t.getRepository(NewsletterEmail).findOne({
        where: {
          address: ILike(recentEmail.to),
        },
        relations: ['user'],
      })
    )
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

    const success = await saveNewsletter(
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
                    by: ${uid}
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
    log.error('Error marking email as item', error)

    return {
      errorCodes: [MarkEmailAsItemErrorCode.BadRequest],
    }
  }
})
