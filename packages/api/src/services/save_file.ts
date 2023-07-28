import { Knex } from 'knex'
import { PubsubClient } from '../datalayer/pubsub'
import { UserData } from '../datalayer/user/model'
import { updatePage } from '../elastic/pages'
import { homePageURL } from '../env'
import {
  ArticleSavingRequestStatus,
  SaveErrorCode,
  SaveFileInput,
  SaveResult,
} from '../generated/graphql'
import { DataModels } from '../resolvers/types'
import { logger } from '../utils/logger'
import { getStorageFileDetails } from '../utils/uploads'
import { createLabels } from './labels'

type SaveContext = {
  pubsub: PubsubClient
  models: DataModels
  authTrx: <TResult>(
    cb: (tx: Knex.Transaction) => TResult,
    userRole?: string
  ) => Promise<TResult>
  uid: string
}

export const saveFile = async (
  ctx: SaveContext,
  saver: UserData,
  input: SaveFileInput
): Promise<SaveResult> => {
  logger.info('saving file with input', input)
  const pageId = input.clientRequestId
  const uploadFile = await ctx.models.uploadFile.getWhere({
    id: input.uploadFileId,
    userId: saver.id,
  })

  if (!uploadFile) {
    return {
      errorCodes: [SaveErrorCode.Unauthorized],
    }
  }

  await getStorageFileDetails(input.uploadFileId, uploadFile.fileName)

  const uploadFileData = await ctx.authTrx(async (tx) => {
    return ctx.models.uploadFile.setFileUploadComplete(input.uploadFileId, tx)
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
    ? await createLabels({ ...ctx, uid: saver.id }, input.labels)
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
    url: `${homePageURL()}/${saver.profile.username}/links/${
      input.clientRequestId
    }`,
  }
}
