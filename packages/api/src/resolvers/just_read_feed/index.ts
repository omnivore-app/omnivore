import { JustReadFeedError, JustReadFeedSuccess } from '../../generated/graphql'
import { getJustReadFeed } from '../../jobs/update_just_read_feed'
import { enqueueUpdateJustReadFeed } from '../../utils/createTask'
import { authorized } from '../../utils/gql-utils'

export const justReadFeedResolver = authorized<
  JustReadFeedSuccess,
  JustReadFeedError
>(async (_, __, { uid, log }) => {
  const feed = await getJustReadFeed(uid)
  log.info('Just read feed fetched')

  if (feed.topics.length === 0) {
    await enqueueUpdateJustReadFeed({
      userId: uid,
    })
  }

  return feed
})
