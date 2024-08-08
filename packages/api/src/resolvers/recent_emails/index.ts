import { ILike } from 'typeorm'
import { NewsletterEmail } from '../../entity/newsletter_email'
import { ReceivedEmail } from '../../entity/received_email'
import { env } from '../../env'
import {
  MarkEmailAsItemError,
  MarkEmailAsItemErrorCode,
  MarkEmailAsItemSuccess,
  MutationMarkEmailAsItemArgs,
  MutationReplyToEmailArgs,
  RecentEmailsError,
  RecentEmailsSuccess,
  ReplyToEmailError,
  ReplyToEmailErrorCode,
  ReplyToEmailSuccess,
} from '../../generated/graphql'
import { getRepository } from '../../repository'
import { updateReceivedEmail } from '../../services/received_emails'
import { saveNewsletter } from '../../services/save_newsletter_email'
import { enqueueSendEmail } from '../../utils/createTask'
import { authorized } from '../../utils/gql-utils'
import { generateUniqueUrl, parseEmailAddress } from '../../utils/parser'
import { sendEmail } from '../../utils/sendEmail'

export const recentEmailsResolver = authorized<
  RecentEmailsSuccess,
  RecentEmailsError
>(async (_, __, { authTrx, uid }) => {
  const recentEmails = await authTrx((t) =>
    t.getRepository(ReceivedEmail).find({
      where: {
        user: { id: uid },
      },
      order: { createdAt: 'DESC' },
      take: 20,
    })
  )

  return {
    recentEmails,
  }
})

export const markEmailAsItemResolver = authorized<
  MarkEmailAsItemSuccess,
  MarkEmailAsItemError,
  MutationMarkEmailAsItemArgs
>(async (_, { recentEmailId }, { authTrx, uid, log }) => {
  const recentEmail = await authTrx((t) =>
    t.getRepository(ReceivedEmail).findOneBy({
      id: recentEmailId,
      user: { id: uid },
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
        user: { id: uid },
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
      author: parseEmailAddress(recentEmail.from).name || recentEmail.from,
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

  return {
    success,
  }
})

export const replyToEmailResolver = authorized<
  ReplyToEmailSuccess,
  ReplyToEmailError,
  MutationReplyToEmailArgs
>(async (_, { recentEmailId, reply }, { uid, log }) => {
  const repo = getRepository(ReceivedEmail)
  const recentEmail = await repo.findOneBy({
    id: recentEmailId,
    user: { id: uid },
  })

  if (!recentEmail) {
    log.info('no recent email', recentEmailId)

    return {
      errorCodes: [ReplyToEmailErrorCode.Unauthorized],
    }
  }

  const result = await enqueueSendEmail({
    userId: uid,
    to: recentEmail.replyTo || recentEmail.from, // send to the reply-to address if it exists or the from address
    subject: 'Re: ' + recentEmail.subject,
    text: reply,
    from: recentEmail.to,
  })

  const success = !!result

  if (success) {
    // update received email reply
    await repo.update(recentEmailId, { reply })
  }

  return {
    success,
  }
})
