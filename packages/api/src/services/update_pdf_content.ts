import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity'
import { LibraryItem, LibraryItemState } from '../entity/library_item'
import { authTrx } from '../repository'
import { libraryItemRepository } from '../repository/library_item'
import { logger } from '../utils/logger'
import { updateLibraryItem } from './library_item'
import { findUploadFileById, setFileUploadComplete } from './upload_file'

export interface UpdateContentMessage {
  fileId: string
  content?: string
  title?: string
  author?: string
  description?: string
  state?: LibraryItemState
}

export const isUpdateContentMessage = (
  data: any
): data is UpdateContentMessage => {
  return 'fileId' in data
}

export const updateContentForFileItem = async (msg: UpdateContentMessage) => {
  const parts = msg.fileId.split('/')
  const fileId = parts && parts.length > 1 ? parts[1] : undefined
  if (!fileId) {
    logger.info('No file id found in message')
    return true
  }

  const uploadFile = await findUploadFileById(fileId)
  if (!uploadFile) {
    logger.info('No file found')
    return false
  }

  const libraryItem = await authTrx(
    async (tx) =>
      tx
        .withRepository(libraryItemRepository)
        .createQueryBuilder('item')
        .innerJoinAndSelect('item.uploadFile', 'file')
        .where('file.id = :fileId', { fileId })
        .getOne(),
    {
      uid: uploadFile.user.id,
    }
  )
  if (!libraryItem) {
    logger.info(`No upload file found for id: ${fileId}`)
    return false
  }

  const itemToUpdate: QueryDeepPartialEntity<LibraryItem> = {
    title: msg.title,
    description: msg.description,
    author: msg.author,
    // content may not be present if we failed to parse the file
    readableContent: msg.content,
    // This event is fired after the file is fully uploaded,
    // so along with updating content, we mark it as
    // succeeded or failed based on the message state
    state: msg.state || LibraryItemState.Succeeded,
  }

  try {
    const uploadFileData = await setFileUploadComplete(
      fileId,
      uploadFile.user.id
    )
    logger.info('updated uploadFileData', uploadFileData)
  } catch (error) {
    logger.info('error marking file upload as completed', error)
  }

  const result = await updateLibraryItem(
    libraryItem.id,
    itemToUpdate,
    uploadFile.user.id
  )
  logger.info('Updating library item text', {
    id: libraryItem.id,
    result,
    content: msg.content?.substring(0, 20),
    state: msg.state,
  })

  return true
}
