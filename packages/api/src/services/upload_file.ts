import { UploadFile } from '../entity/upload_file'
import { authTrx, getRepository } from '../repository'

export const findUploadFileById = async (id: string) => {
  return getRepository(UploadFile).findOne({
    where: { id },
    relations: {
      user: true,
    },
  })
}

export const setFileUploadComplete = async (id: string, userId?: string) => {
  return authTrx(
    async (tx) => {
      const repo = tx.getRepository(UploadFile)
      await repo.update(id, { status: 'COMPLETED' })

      return repo.findOneByOrFail({ id })
    },
    undefined,
    userId
  )
}
