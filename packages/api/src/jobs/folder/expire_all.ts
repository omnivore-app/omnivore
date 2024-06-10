import { findFolderPolicies } from '../../services/folder_policy'
import { enqueueExpireFolderJob } from '../../utils/createTask'
import { logError } from '../../utils/logger'

export const EXPIRE_ALL_FOLDERS_JOB_NAME = 'EXPIRE_ALL_FOLDERS_JOB'

export const expireAllFoldersJob = async () => {
  const policies = await findFolderPolicies()

  // sequentially enqueues a job to expire items for each policy
  for (const policy of policies) {
    try {
      await enqueueExpireFolderJob(policy.userId, policy.id)
    } catch (error) {
      logError(error)

      continue
    }
  }
}
