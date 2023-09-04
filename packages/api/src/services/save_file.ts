import { User } from '../entity/user'
import { homePageURL } from '../env'
import {
  ArticleSavingRequestStatus,
  SaveErrorCode,
  SaveFileInput,
  SaveResult,
} from '../generated/graphql'
import { logger } from '../utils/logger'
import { getStorageFileDetails } from '../utils/uploads'
import { getLabelsAndCreateIfNotExist } from './labels'
import { updateLibraryItem } from './library_item'
import { findUploadFileById, setFileUploadComplete } from './upload_file'

export const saveFile = async (
  input: SaveFileInput,
  user: User
): Promise<SaveResult> => {
  logger.info('saving file with input', input)
  const pageId = input.clientRequestId
  const uploadFile = await findUploadFileById(input.uploadFileId)
  if (!uploadFile) {
    return {
      errorCodes: [SaveErrorCode.Unauthorized],
    }
  }

  await getStorageFileDetails(input.uploadFileId, uploadFile.fileName)

  const uploadFileData = await setFileUploadComplete(input.uploadFileId)

  if (!uploadFileData) {
    return {
      errorCodes: [SaveErrorCode.Unknown],
    }
  }

  // save state
  const archivedAt =
    input.state === ArticleSavingRequestStatus.Archived ? new Date() : null
  // add labels to page
  const labels = input.labels
    ? await getLabelsAndCreateIfNotExist(input.labels, user.id)
    : undefined
  if (input.state || input.labels) {
    const updated = await updateLibraryItem(
      pageId,
      {
        archivedAt,
        labels,
      },
      user.id
    )
    if (!updated) {
      logger.info('error updating page', pageId)
      return {
        errorCodes: [SaveErrorCode.Unknown],
      }
    }
  }

  return {
    clientRequestId: input.clientRequestId,
    url: `${homePageURL()}/${user.profile.username}/links/${
      input.clientRequestId
    }`,
  }
}
