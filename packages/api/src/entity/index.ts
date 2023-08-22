import { EntityManager, EntityTarget, Repository } from 'typeorm'
import { AppDataSource } from '../server'
import { Reminder } from './reminder'
import { UploadFile } from './upload_file'
import { User } from './user'

export const setClaims = async (
  t: EntityManager,
  uid: string
): Promise<void> => {
  const dbRole = 'omnivore_user'
  return t
    .query('SELECT * from omnivore.set_claims($1, $2)', [uid, dbRole])
    .then()
}

export const getRepository = <T>(entity: EntityTarget<T>): Repository<T> => {
  return AppDataSource.getRepository(entity)
}

export const userRepository = getRepository(User)
export const uploadFileRepository = getRepository(UploadFile)
export const reminderRepository = getRepository(Reminder)
