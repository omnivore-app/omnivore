import { entityManager, setClaims } from '../repository'
import { uploadFileRepository } from '../repository/upload_file'

export const findUploadFileById = async (
  id: string,
  userId: string,
  em = entityManager
) => {
  return em.transaction(async (tx) => {
    await setClaims(tx, userId)
    const uploadFile = await tx
      .withRepository(uploadFileRepository)
      .findById(id)

    return uploadFile
  })
}

export const setFileUploadComplete = async (
  id: string,
  userId: string,
  em = entityManager
) => {
  return em.transaction(async (tx) => {
    await setClaims(tx, userId)
    return tx
      .withRepository(uploadFileRepository)
      .save({ id, status: 'COMPLETED' })
  })
}
