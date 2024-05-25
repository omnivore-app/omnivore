import {
  JustReadFeedError,
  JustReadFeedErrorCode,
  JustReadFeedSuccess
} from '../../generated/graphql'
import { getJustReadFeed } from '../../jobs/update_just_read_feed'
import { enqueueUpdateJustReadFeed } from '../../utils/createTask'
import { authorized } from '../../utils/gql-utils'

export const justReadFeedResolver = authorized<
  JustReadFeedSuccess,
  JustReadFeedError
>(async (_, { first, after }, { uid, log }) => {
  const feed = await getJustReadFeed(uid, first, after)
  log.info('Just read feed fetched')

  if (feed.sections.length === 0) {
    await enqueueUpdateJustReadFeed({
      userId: uid,
    })

    log.info('Just read feed update enqueued')

    return {
      errorCodes: [JustReadFeedErrorCode.Pending],
    }
  }

  return feed
})
