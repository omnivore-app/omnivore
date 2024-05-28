import {
  HomeError,
  HomeErrorCode,
  HomeItem,
  HomeSection,
  HomeSuccess,
  QueryHomeArgs,
} from '../../generated/graphql'
import { getHomeSections } from '../../jobs/update_home'
import { getJob } from '../../queue-processor'
import { Merge } from '../../util'
import { enqueueUpdateHomeJob, updateHomeJobId } from '../../utils/createTask'
import { authorized } from '../../utils/gql-utils'

type PartialHomeItem = Merge<Partial<HomeItem>, { type: string }>
type PartialHomeSection = Merge<HomeSection, { items: Array<PartialHomeItem> }>
type PartialHomeSuccess = Merge<
  HomeSuccess,
  {
    edges: Array<{ cursor: string; node: PartialHomeSection }>
  }
>
// This resolver is used to fetch the just read feed for the user.
// when the feed is empty, it enqueues a job to update the feed.
// when client tries to fetch more then the feed has, it enqueues a job to update the feed.
export const homeResolver = authorized<
  PartialHomeSuccess,
  HomeError,
  QueryHomeArgs
>(async (_, { first, after }, { uid, log }) => {
  const limit = first || 6
  const cursor = after ? parseInt(after) : undefined

  const sections = await getHomeSections(uid, limit, cursor)
  log.info('Just read feed sections fetched')

  if (sections.length === 0) {
    const existingJob = await getJob(updateHomeJobId(uid))
    if (existingJob) {
      log.info('Just read feed update job already enqueued')

      return {
        errorCodes: [HomeErrorCode.Pending],
      }
    }

    await enqueueUpdateHomeJob({
      userId: uid,
    })

    log.info('Just read feed update enqueued')

    return {
      errorCodes: [HomeErrorCode.Pending],
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
