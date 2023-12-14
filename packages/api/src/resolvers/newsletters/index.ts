import { NewsletterEmail } from '../../entity/newsletter_email'
import { env } from '../../env'
import {
  CreateNewsletterEmailError,
  CreateNewsletterEmailErrorCode,
  CreateNewsletterEmailSuccess,
  DeleteNewsletterEmailError,
  DeleteNewsletterEmailErrorCode,
  DeleteNewsletterEmailSuccess,
  MutationCreateNewsletterEmailArgs,
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
  CreateNewsletterEmailError,
  MutationCreateNewsletterEmailArgs
>(async (_parent, { input }, { claims, log }) => {
  log.info('createNewsletterEmailResolver')
  analytics.track({
    userId: claims.uid,
    event: 'newsletter_email_address_created',
    properties: {
      env: env.server.apiEnv,
    },
  })

  try {
    const newsletterEmail = await createNewsletterEmail(
      claims.uid,
      undefined,
      input?.folder || undefined,
      input?.name || undefined,
      input?.description || undefined
    )

    return {
      newsletterEmail: {
        ...newsletterEmail,
        subscriptionCount: 0,
      },
    }
  } catch (e) {
    log.error('createNewsletterEmailResolver', e)

    return {
      errorCodes: [CreateNewsletterEmailErrorCode.BadRequest],
    }
  }
})

export const newsletterEmailsResolver = authorized<
  NewsletterEmailsSuccess,
  NewsletterEmailsError
>(async (_parent, _args, { uid, log }) => {
  try {
    const newsletterEmails = await getNewsletterEmails(uid)

    return {
      newsletterEmails: newsletterEmails.map((newsletterEmail) => ({
        ...newsletterEmail,
        subscriptionCount: newsletterEmail.subscriptions.length,
      })),
    }
  } catch (e) {
    log.error('newsletterEmailsResolver', e)

    return {
      errorCodes: [NewsletterEmailsErrorCode.BadRequest],
    }
  }
})

export const deleteNewsletterEmailResolver = authorized<
  DeleteNewsletterEmailSuccess,
  DeleteNewsletterEmailError,
  MutationDeleteNewsletterEmailArgs
>(async (_parent, args, { uid, log }) => {
  analytics.track({
    userId: uid,
    event: 'newsletter_email_address_deleted',
    properties: {
      env: env.server.apiEnv,
    },
  })

  try {
    const newsletterEmail = await getRepository(NewsletterEmail).findOne({
      where: {
        id: args.newsletterEmailId,
        user: { id: uid },
      },
      relations: ['user', 'subscriptions'],
    })

    if (!newsletterEmail) {
      return {
        errorCodes: [DeleteNewsletterEmailErrorCode.NotFound],
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
  } catch (error) {
    log.error('deleteNewsletterEmailResolver', error)

    return {
      errorCodes: [DeleteNewsletterEmailErrorCode.BadRequest],
    }
  }
})
