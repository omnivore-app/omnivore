import { EntityManager, EntityTarget, Repository } from 'typeorm'
import { AppDataSource } from '../data-source'
import { LibraryItem } from '../entity/library_item'
import { Reminder } from '../entity/reminder'
import { UploadFile } from '../entity/upload_file'
import { User } from '../entity/user'

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
  return entityManager.getRepository(entity)
}

export const entityManager = AppDataSource.createEntityManager()

export const userRepository = getRepository(User)
export const uploadFileRepository = getRepository(UploadFile)
export const reminderRepository = getRepository(Reminder)
export const libraryItemRepository = getRepository(LibraryItem)
