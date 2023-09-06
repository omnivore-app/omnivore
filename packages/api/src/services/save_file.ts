import { LibraryItemState } from '../entity/library_item'
import { User } from '../entity/user'
import { homePageURL } from '../env'
import {
  ArticleSavingRequestStatus,
  SaveErrorCode,
  SaveFileInput,
  SaveResult,
} from '../generated/graphql'
import { getStorageFileDetails } from '../utils/uploads'
import { findOrCreateLabels } from './labels'
import { updateLibraryItem } from './library_item'
import { findUploadFileById, setFileUploadComplete } from './upload_file'

export const saveFile = async (
  input: SaveFileInput,
  user: User
): Promise<SaveResult> => {
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

  if (input.state || input.labels) {
    // save state
    const archivedAt =
      input.state === ArticleSavingRequestStatus.Archived ? new Date() : null
    // add labels to page
    const labels = input.labels
      ? await findOrCreateLabels(input.labels, user.id)
      : undefined
    await updateLibraryItem(
      input.clientRequestId,
      {
        archivedAt,
        labels,
        state: input.state
          ? (input.state as unknown as LibraryItemState)
          : LibraryItemState.Succeeded,
      },
      user.id
    )
  }

  return {
    clientRequestId: input.clientRequestId,
    url: `${homePageURL()}/${user.profile.username}/links/${
      input.clientRequestId
    }`,
  }
}
