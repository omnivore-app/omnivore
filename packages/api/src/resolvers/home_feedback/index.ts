import { DatabaseError } from 'pg'
import { QueryFailedError } from 'typeorm'
import { env } from '../../env'
import {
  ErrorCode,
  HomeFeedbackError,
  HomeFeedbackSuccess,
  MutationSendHomeFeedbackArgs,
  SendHomeFeedbackError,
  SendHomeFeedbackSuccess,
} from '../../generated/graphql'
import { analytics } from '../../utils/analytics'
import { authorized } from '../../utils/gql-utils'
import {
  createHomeFeedback,
  findHomeFeedbackByUserId,
} from '../../services/home_feedback'

export const sendHomeFeedbackResolver = authorized<
  SendHomeFeedbackSuccess,
  SendHomeFeedbackError,
  MutationSendHomeFeedbackArgs
>(async (_parent, { input }, { uid, log }) => {
  const { author, site, subscription } = input
  analytics.capture({
    distinctId: uid,
    event: 'send_home_feedback',
    properties: {
      feedback: input.feedbackType,
      env: env.server.apiEnv,
    },
  })

  if (!author && !site && !subscription) {
    log.error('author, site, or subscription is required')
    return {
      errorCodes: [ErrorCode.BadRequest],
    }
  }
  try {
    await createHomeFeedback(uid, {
      site: site ?? undefined,
      author: author ?? undefined,
      subscription: subscription ?? undefined,
      feedbackType: input.feedbackType,
    })
    return {
      __typename: 'SendHomeFeedbackSuccess',
      message: 'Settings updated.',
    }
  } catch (e) {
    log.error(e)

    return {
      errorCodes: [ErrorCode.BadRequest],
    }
  }
})

export const homeFeedbackResolver = authorized<
  HomeFeedbackSuccess,
  HomeFeedbackError
>(async (_parent, { input }, { claims: { uid }, log }) => {
  const offset = input.offset ?? 0
  const limit = Math.min(input.limit ?? 50, 50)

  try {
    log.info('homeFeedbackResolver', {
      labels: {
        source: 'resolver',
        resolver: 'homeFeedbackResolver',
        uid,
      },
    })

    const feedbacks = await findHomeFeedbackByUserId(uid, offset, limit)
    log.info('home feedbacks', feedbacks)

    return {
      items: feedbacks ?? [],
    }
  } catch (e) {
    log.error('Error getting home feedback', {
      e,
      labels: {
        source: 'resolver',
        resolver: 'homeFeedbackResolver',
        uid,
      },
    })
    return {
      errorCodes: [ErrorCode.BadRequest],
    }
  }
})
