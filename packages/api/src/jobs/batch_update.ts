import { BulkActionType } from '../generated/graphql'
import { batchUpdateLibraryItems } from '../services/library_item'

export interface BatchUpdateData {
  userId: string
  libraryItemIds: string[]
  action: BulkActionType
  labelIds?: string[]
  args?: unknown
}

export const BATCH_UPDATE_JOB_NAME = 'batch-update'

export const batchUpdate = async (data: BatchUpdateData) => {
  const { userId, action, labelIds, libraryItemIds, args } = data

  return batchUpdateLibraryItems(action, libraryItemIds, userId, labelIds, args)
}
