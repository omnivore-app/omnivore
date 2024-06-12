import { pruneTrash } from '../services/library_item'

export const PRUNE_TRASH_JOB = 'prune_trash'

export const pruneTrashJob = async () => pruneTrash()
