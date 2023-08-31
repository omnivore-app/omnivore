import { updatePage } from '../elastic/pages'
import { UploadFile } from '../entity/upload_file'
import { User } from '../entity/user'
import { homePageURL } from '../env'
import {
  ArticleSavingRequestStatus,
  SaveErrorCode,
  SaveFileInput,
  SaveResult,
} from '../generated/graphql'
import { entityManager, getRepository } from '../repository'
import { WithDataSourcesContext } from '../resolvers/types'
import { logger } from '../utils/logger'
import { getStorageFileDetails } from '../utils/uploads'
import { getLabelsAndCreateIfNotExist } from './labels'

export const setFileUploadComplete = async (
  id: string,
  em = entityManager
): Promise<UploadFile | null> => {
  return em.getRepository(UploadFile).save({ id, status: 'COMPLETED' })
}

export const saveFile = async (
  ctx: WithDataSourcesContext,
  user: User,
  input: SaveFileInput
): Promise<SaveResult> => {
  logger.info('saving file with input', input)
  const pageId = input.clientRequestId
  const uploadFile = await getRepository(UploadFile).findOneBy({
    id: input.uploadFileId,
    user: { id: ctx.uid },
  })
  if (!uploadFile) {
    return {
      errorCodes: [SaveErrorCode.Unauthorized],
    }
  }

  await getStorageFileDetails(input.uploadFileId, uploadFile.fileName)

  const uploadFileData = await ctx.authTrx(async (tx) => {
    return setFileUploadComplete(input.uploadFileId, tx)
  })

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
    ? await getLabelsAndCreateIfNotExist(ctx, input.labels)
    : undefined
  if (input.state || input.labels) {
    const updated = await updatePage(
      pageId,
      {
        archivedAt,
        labels,
      },
      ctx
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
