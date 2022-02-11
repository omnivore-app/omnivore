import { authorized } from '../../utils/helpers'
import {
  CreateNewsletterEmailSuccess,
  CreateNewsletterEmailError,
  CreateNewsletterEmailErrorCode,
  NewsletterEmailsSuccess,
  NewsletterEmailsError,
  NewsletterEmailsErrorCode,
  DeleteNewsletterEmailErrorCode,
  DeleteNewsletterEmailSuccess,
  DeleteNewsletterEmailError,
  MutationDeleteNewsletterEmailArgs,
} from '../../generated/graphql'
import {
  createNewsletterEmail,
  deleteNewsletterEmail,
  getNewsletterEmails,
} from '../../services/newsletters'
import { NewsletterEmail } from '../../entity/newsletter_email'
import { analytics } from '../../utils/analytics'
import { env } from '../../env'

export const createNewsletterEmailResolver = authorized<
  CreateNewsletterEmailSuccess,
  CreateNewsletterEmailError
>(async (_parent, _args, { claims }) => {
  console.log('createNewsletterEmailResolver')
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
      newsletterEmail: newsletterEmail,
    }
  } catch (e) {
    console.log(e)

    return {
      errorCodes: [CreateNewsletterEmailErrorCode.BadRequest],
    }
  }
})

export const newsletterEmailsResolver = authorized<
  NewsletterEmailsSuccess,
  NewsletterEmailsError
>(async (_parent, _args, { claims }) => {
  console.log('newsletterEmailsResolver')

  try {
    const newsletterEmails = await getNewsletterEmails(claims.uid)

    return {
      newsletterEmails: newsletterEmails,
    }
  } catch (e) {
    console.log(e)

    return {
      errorCodes: [NewsletterEmailsErrorCode.BadRequest],
    }
  }
})

export const deleteNewsletterEmailResolver = authorized<
  DeleteNewsletterEmailSuccess,
  DeleteNewsletterEmailError,
  MutationDeleteNewsletterEmailArgs
>(async (_parent, args, { claims }) => {
  console.log('deleteNewsletterEmailResolver')
  analytics.track({
    userId: claims.uid,
    event: 'newsletter_email_address_deleted',
    properties: {
      env: env.server.apiEnv,
    },
  })

  try {
    const newsletterEmail = await NewsletterEmail.findOne(
      args.newsletterEmailId,
      { relations: ['user'] }
    )

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

    const deleted = await deleteNewsletterEmail(args.newsletterEmailId)
    if (deleted) {
      return {
        newsletterEmail: newsletterEmail,
      }
    } else {
      // when user tries to delete other's newsletters emails or email already deleted
      return {
        errorCodes: [DeleteNewsletterEmailErrorCode.NotFound],
      }
    }
  } catch (e) {
    console.log(e)

    return {
      errorCodes: [DeleteNewsletterEmailErrorCode.BadRequest],
    }
  }
})
