import { LibraryItemState } from '../entity/library_item'
import { User } from '../entity/user'
import { homePageURL } from '../env'
import { SaveErrorCode, SaveFileInput, SaveResult } from '../generated/graphql'
import { logger } from '../utils/logger'
import { getStorageFileDetails } from '../utils/uploads'
import { createAndAddLabelsToLibraryItem } from './labels'
import { findLibraryItemById, updateLibraryItem } from './library_item'
import { findUploadFileById, setFileUploadComplete } from './upload_file'

export const saveFile = async (
  input: SaveFileInput,
  user: User
): Promise<SaveResult> => {
  const libraryItem = await findLibraryItemById(input.clientRequestId, user.id)
  if (!libraryItem) {
    return {
      __typename: 'SaveError',
      errorCodes: [SaveErrorCode.Unauthorized],
    }
  }

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

  try {
    const existingLabels = libraryItem.labelNames || []
    const newLabels = input.labels?.map((l) => l.name) || []
    const combinedLabels = [...new Set([...existingLabels, ...newLabels])]

    await updateLibraryItem(
      input.clientRequestId,
      {
        state:
          (input.state as unknown as LibraryItemState) ||
          LibraryItemState.Succeeded,
        folder: input.folder || undefined,
        savedAt: input.savedAt ? new Date(input.savedAt) : undefined,
        publishedAt: input.publishedAt
          ? new Date(input.publishedAt)
          : undefined,
        labelNames: combinedLabels,
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
  } catch (error) {
    logger.error('Failed to update library item', {
      error,
      clientRequestId: input.clientRequestId,
      userId: user.id,
    })

    return {
      __typename: 'SaveError',
      errorCodes: [SaveErrorCode.Unknown],
    }
  }

  return {
    clientRequestId: input.clientRequestId,
    url: `${homePageURL()}/${user.profile.username}/links/${
      input.clientRequestId
    }`,
  }
}
