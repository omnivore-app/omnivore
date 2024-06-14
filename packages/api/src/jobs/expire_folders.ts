import { appDataSource } from '../data_source'

export const EXPIRE_FOLDERS_JOB_NAME = 'expire-folders'

export const expireFoldersJob = async () => {
  await appDataSource.query('CALL omnivore.expire_folders()')
}
