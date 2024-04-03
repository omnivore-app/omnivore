import { LibraryItemState } from '../entity/library_item'
import { User } from '../entity/user'
import { homePageURL } from '../env'
import { SaveErrorCode, SaveFileInput, SaveResult } from '../generated/graphql'
import { getStorageFileDetails } from '../utils/uploads'
import { createAndAddLabelsToLibraryItem } from './labels'
import { updateLibraryItem } from './library_item'
import { findUploadFileById, setFileUploadComplete } from './upload_file'

export const saveFile = async (
  input: SaveFileInput,
  user: User
): Promise<SaveResult> => {
  const uploadFile = await findUploadFileById(input.uploadFileId)
  if (!uploadFile) {
    return {
      __typename: 'SaveError',
      errorCodes: [SaveErrorCode.Unauthorized],
    }
  }

  await getStorageFileDetails(input.uploadFileId, uploadFile.fileName)

  const uploadFileData = await setFileUploadComplete(input.uploadFileId)

  if (!uploadFileData) {
    return {
      __typename: 'SaveError',
      errorCodes: [SaveErrorCode.Unknown],
    }
  }

  await updateLibraryItem(
    input.clientRequestId,
    {
      state:
        (input.state as unknown as LibraryItemState) ||
        LibraryItemState.Succeeded,
      folder: input.folder || undefined,
      savedAt: input.savedAt ? new Date(input.savedAt) : undefined,
      publishedAt: input.publishedAt ? new Date(input.publishedAt) : undefined,
      labelNames: input.labels?.map((label) => label.name) || undefined,
    },
    user.id
  )

  // add labels to item
  await createAndAddLabelsToLibraryItem(
    input.clientRequestId,
    user.id,
    input.labels,
    input.subscription
  )

  return {
    clientRequestId: input.clientRequestId,
    url: `${homePageURL()}/${user.profile.username}/links/${
      input.clientRequestId
    }`,
  }
}
