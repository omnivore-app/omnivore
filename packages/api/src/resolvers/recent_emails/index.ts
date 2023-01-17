import {
  RecentEmailsError,
  RecentEmailsErrorCode,
  RecentEmailsSuccess,
} from '../../generated/graphql'
import { authorized } from '../../utils/helpers'
import { getRepository } from '../../entity/utils'
import { ReceivedEmail } from '../../entity/received_email'

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
