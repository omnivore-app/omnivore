import { BulkActionType } from '../generated/graphql'
import { batchUpdateLibraryItems } from '../services/library_item'

export interface BatchUpdateData {
  userId: string
  labelIds: string[]
  libraryItemIds: string[]
  action: BulkActionType
  size: number
  args?: unknown
}

export const BATCH_UPDATE_JOB_NAME = 'batch-update'

export const batchUpdate = async (data: BatchUpdateData) => {
  const { userId, action, labelIds, libraryItemIds, args, size } = data

  const searchArgs = {
    size,
    query: `in:all includes:${libraryItemIds.join()}`,
  }

  await batchUpdateLibraryItems(action, searchArgs, userId, labelIds, args)

  return true
}
