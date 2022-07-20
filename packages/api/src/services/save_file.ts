import Knex from 'knex'
import { PubsubClient } from '../datalayer/pubsub'
import { UserData } from '../datalayer/user/model'
import { homePageURL } from '../env'
import { SaveErrorCode, SaveFileInput, SaveResult } from '../generated/graphql'
import { DataModels } from '../resolvers/types'
import { getStorageFileDetails } from '../utils/uploads'

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
  console.log('saving file with input', input)

  const uploadFile = await ctx.models.uploadFile.getWhere({
    id: input.uploadFileId,
    userId: saver.id,
  })

  if (!uploadFile) {
    return {
      errorCodes: [SaveErrorCode.Unauthorized],
    }
  }

  const uploadFileDetails = await getStorageFileDetails(
    input.uploadFileId,
    uploadFile.fileName
  )

  const uploadFileData = await ctx.authTrx(async (tx) => {
    return ctx.models.uploadFile.setFileUploadComplete(input.uploadFileId, tx)
  })

  return {
    clientRequestId: input.clientRequestId,
    url: `${homePageURL()}/${saver.profile.username}/links/${
      input.clientRequestId
    }`,
  }
}
