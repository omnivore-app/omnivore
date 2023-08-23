import { NewsletterEmail } from '../../entity/newsletter_email'
import { User } from '../../entity/user'
import { env } from '../../env'
import {
  CreateNewsletterEmailError,
  CreateNewsletterEmailErrorCode,
  CreateNewsletterEmailSuccess,
  DeleteNewsletterEmailError,
  DeleteNewsletterEmailErrorCode,
  DeleteNewsletterEmailSuccess,
  MutationDeleteNewsletterEmailArgs,
  NewsletterEmailsError,
  NewsletterEmailsErrorCode,
  NewsletterEmailsSuccess,
} from '../../generated/graphql'
import { getRepository } from '../../repository'
import {
  createNewsletterEmail,
  deleteNewsletterEmail,
  getNewsletterEmails,
} from '../../services/newsletters'
import { unsubscribeAll } from '../../services/subscriptions'
import { analytics } from '../../utils/analytics'
import { authorized } from '../../utils/helpers'

export const createNewsletterEmailResolver = authorized<
  CreateNewsletterEmailSuccess,
  CreateNewsletterEmailError
>(async (_parent, _args, { claims, log }) => {
  log.info('createNewsletterEmailResolver')
  analytics.track({
    userId: claims.uid,
    event: 'newsletter_email_address_created',
    properties: {
      env: env.server.apiEnv,
    },
  })

  try {
    const newsletterEmail = await createNewsletterEmail(claims.uid)

    return {
      newsletterEmail: {
        ...newsletterEmail,
        subscriptionCount: 0,
      },
    }
  } catch (e) {
    log.info(e)

    return {
      errorCodes: [CreateNewsletterEmailErrorCode.BadRequest],
    }
  }
})

export const newsletterEmailsResolver = authorized<
  NewsletterEmailsSuccess,
  NewsletterEmailsError
>(async (_parent, _args, { claims, log }) => {
  log.info('newsletterEmailsResolver')

  try {
    const user = await getRepository(User).findOneBy({
      id: claims.uid,
    })
    if (!user) {
      return Promise.reject({
        errorCode: NewsletterEmailsErrorCode.Unauthorized,
      })
    }

    const newsletterEmails = await getNewsletterEmails(user.id)

    return {
      newsletterEmails: newsletterEmails.map((newsletterEmail) => ({
        ...newsletterEmail,
        subscriptionCount: newsletterEmail.subscriptions.length,
      })),
    }
  } catch (e) {
    log.info(e)

    return {
      errorCodes: [NewsletterEmailsErrorCode.BadRequest],
    }
  }
})

export const deleteNewsletterEmailResolver = authorized<
  DeleteNewsletterEmailSuccess,
  DeleteNewsletterEmailError,
  MutationDeleteNewsletterEmailArgs
>(async (_parent, args, { claims, log }) => {
  log.info('deleteNewsletterEmailResolver')
  analytics.track({
    userId: claims.uid,
    event: 'newsletter_email_address_deleted',
    properties: {
      env: env.server.apiEnv,
    },
  })

  try {
    const newsletterEmail = await getRepository(NewsletterEmail).findOne({
      where: {
        id: args.newsletterEmailId,
      },
      relations: ['user', 'subscriptions'],
    })

    if (!newsletterEmail) {
      return {
        errorCodes: [DeleteNewsletterEmailErrorCode.NotFound],
      }
    }

    if (newsletterEmail.user.id !== claims.uid) {
      return {
        errorCodes: [DeleteNewsletterEmailErrorCode.Unauthorized],
      }
    }

    // unsubscribe all before deleting
    await unsubscribeAll(newsletterEmail)

    const deleted = await deleteNewsletterEmail(args.newsletterEmailId)
    if (deleted) {
      return {
        newsletterEmail: {
          ...newsletterEmail,
          subscriptionCount: newsletterEmail.subscriptions.length,
        },
      }
    } else {
      // when user tries to delete other's newsletters emails or email already deleted
      return {
        errorCodes: [DeleteNewsletterEmailErrorCode.NotFound],
      }
    }
  } catch (e) {
    log.info(e)

    return {
      errorCodes: [DeleteNewsletterEmailErrorCode.BadRequest],
    }
  }
})
