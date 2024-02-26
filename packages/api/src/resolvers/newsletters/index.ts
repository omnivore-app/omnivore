import {
  DEFAULT_NEWSLETTER_FOLDER,
  NewsletterEmail,
} from '../../entity/newsletter_email'
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
  MutationUpdateNewsletterEmailArgs,
  NewsletterEmailsError,
  NewsletterEmailsErrorCode,
  NewsletterEmailsSuccess,
  UpdateNewsletterEmailError,
  UpdateNewsletterEmailErrorCode,
  UpdateNewsletterEmailSuccess,
} from '../../generated/graphql'
import { getRepository } from '../../repository'
import {
  createNewsletterEmail,
  deleteNewsletterEmail,
  getNewsletterEmails,
  updateNewsletterEmail,
} from '../../services/newsletters'
import { unsubscribeAll } from '../../services/subscriptions'
import { Merge } from '../../util'
import { analytics } from '../../utils/analytics'
import { authorized } from '../../utils/gql-utils'

export type CreateNewsletterEmailSuccessPartial = Merge<
  CreateNewsletterEmailSuccess,
  { newsletterEmail: NewsletterEmail }
>
export const createNewsletterEmailResolver = authorized<
  CreateNewsletterEmailSuccessPartial,
  CreateNewsletterEmailError,
  MutationCreateNewsletterEmailArgs
>(async (_parent, { input }, { uid, log }) => {
  log.info('createNewsletterEmailResolver')
  analytics.capture({
    distinctId: uid,
    event: 'newsletter_email_address_created',
    properties: {
      env: env.server.apiEnv,
    },
  })

  try {
    const newsletterEmail = await createNewsletterEmail(
      uid,
      undefined,
      input?.folder || DEFAULT_NEWSLETTER_FOLDER,
      input?.name || undefined,
      input?.description || undefined
    )

    return {
      newsletterEmail,
    }
  } catch (e) {
    log.error('createNewsletterEmailResolver', e)

    return {
      errorCodes: [CreateNewsletterEmailErrorCode.BadRequest],
    }
  }
})

export type NewsletterEmailsSuccessPartial = Merge<
  NewsletterEmailsSuccess,
  { newsletterEmails: NewsletterEmail[] }
>
export const newsletterEmailsResolver = authorized<
  NewsletterEmailsSuccessPartial,
  NewsletterEmailsError
>(async (_parent, _args, { uid, log }) => {
  try {
    const newsletterEmails = await getNewsletterEmails(uid)

    return {
      newsletterEmails,
    }
  } catch (e) {
    log.error('newsletterEmailsResolver', e)

    return {
      errorCodes: [NewsletterEmailsErrorCode.BadRequest],
    }
  }
})

export type DeleteNewsletterEmailSuccessPartial = Merge<
  DeleteNewsletterEmailSuccess,
  { newsletterEmail: NewsletterEmail }
>
export const deleteNewsletterEmailResolver = authorized<
  DeleteNewsletterEmailSuccessPartial,
  DeleteNewsletterEmailError,
  MutationDeleteNewsletterEmailArgs
>(async (_parent, args, { uid, log }) => {
  analytics.capture({
    distinctId: uid,
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
        newsletterEmail,
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

export type UpdateNewsletterEmailSuccessPartial = Merge<
  UpdateNewsletterEmailSuccess,
  { newsletterEmail: NewsletterEmail }
>
export const updateNewsletterEmailResolver = authorized<
  UpdateNewsletterEmailSuccessPartial,
  UpdateNewsletterEmailError,
  MutationUpdateNewsletterEmailArgs
>(async (_parent, { input }, { uid, log }) => {
  analytics.capture({
    distinctId: uid,
    event: 'newsletter_email_updated',
    properties: {
      env: env.server.apiEnv,
      ...input,
    },
  })

  const updatedNewsletterEmail = await updateNewsletterEmail(input.id, uid, {
    name: input.name,
    description: input.description,
    folder: input.folder,
  })
  if (!updatedNewsletterEmail) {
    log.error('failed to update newsletter email')

    return {
      errorCodes: [UpdateNewsletterEmailErrorCode.Unauthorized],
    }
  }

  return {
    newsletterEmail: updatedNewsletterEmail,
  }
})
