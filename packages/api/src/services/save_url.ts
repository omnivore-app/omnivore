import { PubsubClient } from '../datalayer/pubsub'
import { UserData } from '../datalayer/user/model'
import { homePageURL } from '../env'
import { SaveErrorCode, SaveResult, SaveUrlInput } from '../generated/graphql'
import { DataModels } from '../resolvers/types'
import { createPageSaveRequest } from './create_page_save_request'

type SaveContext = {
  pubsub: PubsubClient
  models: DataModels
}

export const saveUrl = async (
  ctx: SaveContext,
  saver: UserData,
  input: SaveUrlInput
): Promise<SaveResult> => {
  try {
    const pageSaveRequest = await createPageSaveRequest(
      saver.id,
      input.url,
      ctx.models,
      ctx.pubsub,
      input.clientRequestId
    )

    return {
      clientRequestId: pageSaveRequest.id,
      url: `${homePageURL()}/${saver.profile.username}/links/${
        input.clientRequestId
      }`,
    }
  } catch (error) {
    console.log('error enqueuing request', error)
    return {
      errorCodes: [SaveErrorCode.Unknown],
    }
  }
}
