import { BulkActionType } from '../generated/graphql'
import { getBackendQueue } from '../queue-processor'
import { searchLibraryItems } from '../services/library_item'
import { stringToHash } from '../utils/helpers'
import { logger } from '../utils/logger'
import { BATCH_UPDATE_JOB_NAME } from './batch_update'

export interface BulkActionData {
  count: number
  userId: string
  action: BulkActionType
  query: string
  batchSize: number
  labelIds?: string[]
  args?: unknown
  useFolders?: boolean
}

export const BULK_ACTION_JOB_NAME = 'bulk-action'

export const bulkAction = async (data: BulkActionData, id?: string) => {
  if (!id) {
    throw new Error('Missing id')
  }

  const {
    userId,
    action,
    query,
    labelIds,
    count,
    args,
    batchSize,
    useFolders,
  } = data

  const queue = await getBackendQueue()
  if (!queue) {
    throw new Error('Queue not initialized')
  }
  const parent = { id, queue: queue.name }
  let offset = 0

  do {
    const searchArgs = {
      size: batchSize,
      from: offset,
      query,
      useFolders,
    }

    const searchResult = await searchLibraryItems(searchArgs, userId)
    const libraryItemIds = searchResult.libraryItems.map((item) => item.id)
    const data = {
      userId,
      action,
      labelIds,
      libraryItemIds,
      args,
      size: batchSize,
    }
    const libraryItemIdsStr = libraryItemIds.sort().join()
    const jobId = `${BATCH_UPDATE_JOB_NAME}-${stringToHash(libraryItemIdsStr)}`

    // enqueue job for each batch
    try {
      await queue.add(BATCH_UPDATE_JOB_NAME, data, {
        attempts: 1,
        priority: 10,
        jobId, // deduplication
        removeOnComplete: true,
        removeOnFail: true,
        parent, // for tracking
      })
    } catch (error) {
      logger.error('Error enqueuing batch update job', error)
    }

    offset += batchSize
  } while (offset < count)

  return true
}
