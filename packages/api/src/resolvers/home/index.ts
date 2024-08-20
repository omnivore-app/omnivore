import {
  HiddenHomeSectionError,
  HiddenHomeSectionSuccess,
  HomeError,
  HomeErrorCode,
  HomeItem,
  HomeSection,
  HomeSuccess,
  QueryHomeArgs,
  RefreshHomeError,
  RefreshHomeErrorCode,
  RefreshHomeSuccess,
} from '../../generated/graphql'
import { deleteHome, getHomeSections } from '../../jobs/update_home'
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
  // cursor is the timestamp of the last item in the feed
  // if cursor is not provided, it defaults to the current time
  const cursor = after ? parseInt(after) : Date.now()

  const sections = await getHomeSections(uid, limit, cursor)
  log.info('Home sections fetched')

  if (!sections) {
    // home feed creation pending
    const existingJob = await getJob(updateHomeJobId(uid))
    if (existingJob) {
      log.info('Update job job already enqueued')

      return {
        errorCodes: [HomeErrorCode.Pending],
      }
    }

    await enqueueUpdateHomeJob({
      userId: uid,
      cursor,
    })

    log.info('Update home job enqueued')

    return {
      errorCodes: [HomeErrorCode.Pending],
    }
  }

  if (sections.length === 0) {
    // no available candidates
    return {
      edges: [],
      pageInfo: {
        hasPreviousPage: false,
        hasNextPage: false,
      },
    }
  }

  const endCursor = sections[sections.length - 1].score.toString()

  const edges = sections.map((section) => {
    if (section.member.layout === 'hidden') {
      section.member.items = []
    }

    return {
      cursor: section.score.toString(),
      node: section.member,
    }
  })

  return {
    edges,
    pageInfo: {
      startCursor: after,
      endCursor,
      hasPreviousPage: true, // there is always a previous page for newer items
      hasNextPage: true, // there is always a next page for older items
    },
  }
})

export const refreshHomeResolver = authorized<
  RefreshHomeSuccess,
  RefreshHomeError
>(async (_, __, { uid, log }) => {
  await deleteHome(uid)
  log.info('Home cache deleted')

  const existingJob = await getJob(updateHomeJobId(uid))
  if (existingJob) {
    log.info('Update home job already enqueued')

    return {
      errorCodes: [RefreshHomeErrorCode.Pending],
    }
  }

  await enqueueUpdateHomeJob({
    userId: uid,
  })

  log.info('Update home job enqueued')

  return {
    success: true,
  }
})

type PartialHiddenHomeSectionSuccess = Merge<
  HiddenHomeSectionSuccess,
  {
    section?: PartialHomeSection
  }
>
export const hiddenHomeSectionResolver = authorized<
  PartialHiddenHomeSectionSuccess,
  HiddenHomeSectionError
>(async (_, __, { uid, log }) => {
  const sections = await getHomeSections(uid)
  log.info('Home sections fetched')

  if (!sections) {
    return {
      errorCodes: [HomeErrorCode.Pending],
    }
  }

  const hiddenSection = sections.find(
    (section) => section.member.layout === 'hidden'
  )

  return {
    section: hiddenSection?.member,
  }
})
