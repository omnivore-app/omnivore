import { entityManager } from '.'
import { UploadFile } from '../entity/upload_file'

export const uploadFileRepository = entityManager
  .getRepository(UploadFile)
  .extend({
    findById(id: string) {
      return this.findOneBy({ id })
    },
  })
