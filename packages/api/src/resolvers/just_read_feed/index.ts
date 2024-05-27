import {
  JustReadFeedError,
  JustReadFeedErrorCode,
  JustReadFeedItem,
  JustReadFeedSection,
  JustReadFeedSuccess,
  QueryJustReadFeedArgs,
} from '../../generated/graphql'
import { getJustReadFeedSections } from '../../jobs/update_just_read_feed'
import { getJob } from '../../queue-processor'
import { Merge } from '../../util'
import {
  enqueueUpdateJustReadFeed,
  updateJustReadFeedJobId,
} from '../../utils/createTask'
import { authorized } from '../../utils/gql-utils'

type PartialJustReadFeedItem = Merge<
  Partial<JustReadFeedItem>,
  { type: string }
>
type PartialJustReadFeedSection = Merge<
  JustReadFeedSection,
  { items: Array<PartialJustReadFeedItem> }
>
type PartialJustReadFeedSuccess = Merge<
  JustReadFeedSuccess,
  {
    edges: Array<{ cursor: string; node: PartialJustReadFeedSection }>
  }
>
// This resolver is used to fetch the just read feed for the user.
// when the feed is empty, it enqueues a job to update the feed.
// when client tries to fetch more then the feed has, it enqueues a job to update the feed.
export const justReadFeedResolver = authorized<
  PartialJustReadFeedSuccess,
  JustReadFeedError,
  QueryJustReadFeedArgs
>(async (_, { first, after }, { uid, log }) => {
  const limit = first || 10
  const cursor = after ? parseInt(after) : undefined

  const sections = await getJustReadFeedSections(uid, limit, cursor)
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
