import { env } from '../env'
import { authTrx } from '../repository'
import { analytics } from '../utils/analytics'
import { HomeFeedback, HomeFeedbackType } from '../entity/home_feedback'
import { QueryFailedError } from 'typeorm'
import { DatabaseError } from 'pg'

const PG_UNIQUE_CONSTRAINT_VIOLATION = '23505'

export const findHomeFeedbackByUserId = async (
  userId: string
): Promise<HomeFeedback[]> => {
  return authTrx(
    (t) =>
      t.getRepository(HomeFeedback).findBy({
        user: { id: userId },
      }),
    undefined,
    userId
  )
}

export const createHomeFeedback = async (
  userId: string,
  feedback: {
    site: string | undefined
    author: string | undefined
    subscription: string | undefined
    feedbackType: HomeFeedbackType
  }
): Promise<HomeFeedback> => {
  analytics.capture({
    distinctId: userId,
    event: 'home_feedback_created',
    properties: {
      env: env.server.apiEnv,
    },
  })

  try {
    return await authTrx(
      (t) =>
        t.getRepository(HomeFeedback).save({
          user: { id: userId },
          site: feedback.site,
          author: feedback.author,
          subscription: feedback.subscription,
          feedbackType: feedback.feedbackType,
        }),
      undefined,
      userId
    )
  } catch (e) {
    // If there is a unique constraint violation query for the item
    // and return it, if we can't find it throw the exception up
    // the stack
    if (
      e instanceof QueryFailedError &&
      (e.driverError as DatabaseError).code === PG_UNIQUE_CONSTRAINT_VIOLATION
    ) {
      const result = await authTrx(
        (t) =>
          t.getRepository(HomeFeedback).findOne({
            where: {
              user: { id: userId },
              site: feedback.site,
              author: feedback.author,
              subscription: feedback.subscription,
            },
          }),
        undefined,
        userId
      )
      if (result) {
        return result
      }
    }
    throw e
  }
}

export const deleteHomeFeedback = async (
  userId: string,
  feedbackId: string
) => {
  analytics.capture({
    distinctId: userId,
    event: 'home_feedback_deleted',
    properties: {
      env: env.server.apiEnv,
    },
  })
  return authTrx(
    async (t) => {
      await t.getRepository(HomeFeedback).delete({
        id: feedbackId,
        user: { id: userId },
      })
    },
    undefined,
    userId
  )
}
