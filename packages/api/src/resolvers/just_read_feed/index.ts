import {
  JustReadFeedError,
  JustReadFeedSuccess,
  QueryJustReadFeedArgs,
} from '../../generated/graphql'
import { getJustReadFeed } from '../../jobs/update_just_read_feed'
import { enqueueUpdateJustReadFeed } from '../../utils/createTask'
import { authorized } from '../../utils/gql-utils'

export const justReadFeedResolver = authorized<
  JustReadFeedSuccess,
  JustReadFeedError,
  QueryJustReadFeedArgs
>(async (_, { first, after }, { uid, log }) => {
  first = first || 10
  after = after || '0'
  const offset = parseInt(after, 10)

  const feed = await getJustReadFeed(uid, first, offset)
  if (feed.topics.length === 0) {
    log.info('No feed items found, updating feed')

    await enqueueUpdateJustReadFeed({ userId: uid })

    return {
      topics: [],
    }
  }

  return feed
})
