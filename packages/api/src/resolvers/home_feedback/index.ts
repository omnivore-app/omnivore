import { DatabaseError } from 'pg'
import { QueryFailedError } from 'typeorm'
import { env } from '../../env'
import {
  ErrorCode,
  HomeFeedback,
  HomeFeedbackError,
  HomeFeedbackSuccess,
  MutationSendHomeFeedbackArgs,
  SendHomeFeedbackError,
  SendHomeFeedbackSuccess,
} from '../../generated/graphql'
import { analytics } from '../../utils/analytics'
import { authorized } from '../../utils/gql-utils'
import {
  HomeFeedback as HomeFeedbackModel,
  HomeFeedbackType,
  HomeFeedbackType as HomeFeedbackTypeModel,
} from '../../entity/home_feedback'
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
    },
  })

  if (!author && !site && !subscription) {
    log.error('author, site, or subscription is required')
    return {
      errorCodes: [ErrorCode.BadRequest],
    }
  }
  try {
    console.log('will update with these values: ', input.feedbackType)
    await createHomeFeedback(uid, {
      site: site ?? undefined,
      author: author ?? undefined,
      subscription: subscription ?? undefined,
      feedbackType: input.feedbackType,
    })
    console.log('returning success')
    return {
      __typename: 'SendHomeFeedbackSuccess',
      message: 'Settings updated.',
    }
  } catch (e) {
    console.log('caught error', e)
    log.error(e)

    return {
      errorCodes: [ErrorCode.BadRequest],
    }
  }
})

export const homeFeedbackResolver = authorized<
  HomeFeedbackSuccess,
  HomeFeedbackError
>(async (_parent, _args, { claims: { uid }, log }) => {
  try {
    log.info('homeFeedbackResolver', {
      labels: {
        source: 'resolver',
        resolver: 'homeFeedbackResolver',
        uid,
      },
    })

    const feedbacks = await findHomeFeedbackByUserId(uid)
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
