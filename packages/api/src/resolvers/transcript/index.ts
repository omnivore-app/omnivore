import {
  FetchTranscriptError,
  FetchTranscriptErrorCode,
  FetchTranscriptSuccess,
  MutationFetchTranscriptArgs,
  TaskState,
} from '../../generated/graphql'
import { findLibraryItemById } from '../../services/library_item'
import { enqueueProcessYouTubeTranscript } from '../../utils/createTask'
import { authorized } from '../../utils/gql-utils'
import { logError } from '../../utils/logger'
import { isYouTubeVideoURL } from '../../utils/youtube'

export const fetchTranscriptResolver = authorized<
  FetchTranscriptSuccess,
  FetchTranscriptError,
  MutationFetchTranscriptArgs
>(async (_, { id }, { uid, log }) => {
  if (!id) {
    return {
      errorCodes: [FetchTranscriptErrorCode.BadRequest],
    }
  }

  const libraryItem = await findLibraryItemById(id, uid, {
    select: ['originalUrl'],
  })
  if (!libraryItem) {
    log.error('Library item not found', { id })
    return {
      errorCodes: [FetchTranscriptErrorCode.Unauthorized],
    }
  }

  if (!isYouTubeVideoURL(libraryItem.originalUrl)) {
    log.error('Not a YouTube video', {
      id,
      originalUrl: libraryItem.originalUrl,
    })

    return {
      errorCodes: [FetchTranscriptErrorCode.BadRequest],
    }
  }

  try {
    const job = await enqueueProcessYouTubeTranscript({
      libraryItemId: id,
      userId: uid,
    })

    if (!job || !job.job.id) {
      log.error('Failed to create task', { id })
      return {
        errorCodes: [FetchTranscriptErrorCode.FailedToCreateTask],
      }
    }

    return {
      task: {
        id: job.job.id,
        name: job.job.name,
        state: TaskState.Pending,
        createdAt: new Date(job.job.timestamp),
        progress: 0,
        runningTime: 0,
        cancellable: true,
      },
    }
  } catch (error) {
    logError(error)
    return {
      errorCodes: [FetchTranscriptErrorCode.FailedToCreateTask],
    }
  }
})
