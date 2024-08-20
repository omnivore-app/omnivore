import { appDataSource } from '../data_source'

export const PRUNE_TRASH_JOB = 'prune_trash'

interface PruneTrashJobData {
  numDays: number
}

export const pruneTrashJob = async (jobData: PruneTrashJobData) => {
  // call the stored procedure to delete trash items older than {numDays} days
  await appDataSource.query(
    `CALL omnivore.batch_delete_trash_items(${jobData.numDays});`
  )
}
