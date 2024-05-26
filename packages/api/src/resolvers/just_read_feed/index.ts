import {
  JustReadFeedError,
  JustReadFeedErrorCode,
  JustReadFeedSuccess,
  QueryJustReadFeedArgs,
} from '../../generated/graphql'
import { getJustReadFeedSections } from '../../jobs/update_just_read_feed'
import { getJob } from '../../queue-processor'
import {
  enqueueUpdateJustReadFeed,
  updateJustReadFeedJobId,
} from '../../utils/createTask'
import { authorized } from '../../utils/gql-utils'

// This resolver is used to fetch the just read feed for the user.
// when the feed is empty, it enqueues a job to update the feed.
// when client tries to fetch more then the feed has, it enqueues a job to update the feed.
export const justReadFeedResolver = authorized<
  JustReadFeedSuccess,
  JustReadFeedError,
  QueryJustReadFeedArgs
>(async (_, { first, after }, { uid, log }) => {
  const limit = first || 10
  const minScore = after ? Number(after) : 0

  const sections = await getJustReadFeedSections(uid, limit, minScore)
  log.info('Just read feed sections fetched')

  if (sections.length === 0) {
    const existingJob = await getJob(updateJustReadFeedJobId(uid))
    if (existingJob) {
      log.info('Just read feed update job already enqueued')

      return {
        errorCodes: [JustReadFeedErrorCode.Pending],
      }
    }

    await enqueueUpdateJustReadFeed({
      userId: uid,
    })

    log.info('Just read feed update enqueued')

    return {
      errorCodes: [JustReadFeedErrorCode.Pending],
    }
  }

  const edges = sections.map((section) => ({
    cursor: section.score.toString(),
    node: section.member,
  }))

  return {
    edges,
    pageInfo: {
      hasPreviousPage: true, // there is always a previous page for new items
      hasNextPage: true, // there is always a next page for old items
    },
  }
})
