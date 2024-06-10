import { FolderPolicyAction } from '../../entity/folder_policy'
import { BulkActionType } from '../../generated/graphql'
import { findFolderPolicyById } from '../../services/folder_policy'
import { batchUpdateLibraryItems } from '../../services/library_item'
import { logger } from '../../utils/logger'

export const EXPIRE_FOLDER_JOB_NAME = 'EXPIRE_FOLDER_JOB'

interface ExpireFolderJobData {
  userId: string
  folderPolicyId: string
}

export const expireFolderJob = async (data: ExpireFolderJobData) => {
  const { userId, folderPolicyId } = data

  const policy = await findFolderPolicyById(userId, folderPolicyId)
  if (!policy) {
    logger.error('Policy not found')
    return
  }

  logger.info(`Expiring items for policy ${policy.id}`)

  const getBulkActionType = (action: FolderPolicyAction) => {
    switch (action) {
      case FolderPolicyAction.Archive:
        return BulkActionType.Archive
      case FolderPolicyAction.Delete:
        return BulkActionType.Delete
      default:
        logger.error('Unsupported action')
        throw new Error('Unsupported action')
    }
  }

  const action = getBulkActionType(policy.action)
  const savedAfter = new Date(
    Date.now() - policy.afterDays * 24 * 60 * 60 * 1000
  )

  await batchUpdateLibraryItems(
    action,
    {
      useFolders: true,
      query: `in:${policy.folder} saved:<${savedAfter.toISOString()}`,
    },
    userId
  )
}
