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
import { findOrCreateLabels, saveLabelsInLibraryItem } from './labels'
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
    await updateLibraryItem(
      input.clientRequestId,
      {
        state: LibraryItemState.Succeeded,
        folder:
          input.state === ArticleSavingRequestStatus.Archived
            ? 'archive'
            : 'inbox',
      },
      user.id
    )
    // add labels to item
    if (input.labels) {
      const labels = await findOrCreateLabels(input.labels, user.id)
      await saveLabelsInLibraryItem(labels, input.clientRequestId, user.id)
    }
  }

  return {
    clientRequestId: input.clientRequestId,
    url: `${homePageURL()}/${user.profile.username}/links/${
      input.clientRequestId
    }`,
  }
}
