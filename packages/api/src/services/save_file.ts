import { LibraryItemState } from '../entity/library_item'
import { User } from '../entity/user'
import { homePageURL } from '../env'
import { SaveErrorCode, SaveFileInput, SaveResult } from '../generated/graphql'
import { getStorageFileDetails } from '../utils/uploads'
import { createAndSaveLabelsInLibraryItem } from './labels'
import { updateLibraryItem } from './library_item'
import { findUploadFileById, setFileUploadComplete } from './upload_file'

export const saveFile = async (
  input: SaveFileInput,
  user: User,
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

  if (input.state || input.folder) {
    await updateLibraryItem(
      input.clientRequestId,
      {
        state: (input.state as unknown as LibraryItemState) || undefined,
        folder: input.folder || undefined,
      },
      user.id,
    )
  }

  // add labels to item
  await createAndSaveLabelsInLibraryItem(
    input.clientRequestId,
    user.id,
    input.labels
  )

  return {
    clientRequestId: input.clientRequestId,
    url: `${homePageURL()}/${user.profile.username}/links/${
      input.clientRequestId
    }`,
  }
}
