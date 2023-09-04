import { UploadFile } from '../entity/upload_file'
import { authTrx, getRepository } from '../repository'

export const findUploadFileById = async (id: string) => {
  return getRepository(UploadFile).findOneBy({ id })
}

export const setFileUploadComplete = async (id: string, userId?: string) => {
  return authTrx(
    async (tx) =>
      tx.getRepository(UploadFile).save({ id, status: 'COMPLETED' }),
    undefined,
    userId
  )
}
