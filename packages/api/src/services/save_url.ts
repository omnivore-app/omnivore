import { PubsubClient } from '../datalayer/pubsub'
import { UserData } from '../datalayer/user/model'
import { homePageURL } from '../env'
import { SaveResult, SaveUrlInput } from '../generated/graphql'
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
    await createPageSaveRequest(
      saver.id,
      input.url,
      ctx.models,
      'high',
      input.clientRequestId
    )
  } catch (error) {
    console.log('error enqueuing request', error)
  }

  return {
    clientRequestId: input.clientRequestId,
    url: `${homePageURL()}/${saver.profile.username}/links/${
      input.clientRequestId
    }`,
  }
}
