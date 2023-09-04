import { UploadFile } from '../entity/upload_file'
import { authTrx } from '../repository'

export const findUploadFileById = async (id: string) => {
  return authTrx(async (tx) => tx.getRepository(UploadFile).findBy({ id }))
}

export const setFileUploadComplete = async (id: string) => {
  return authTrx(async (tx) =>
    tx.getRepository(UploadFile).save({ id, status: 'COMPLETED' })
  )
}
