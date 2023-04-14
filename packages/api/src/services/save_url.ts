import { PubsubClient } from '../datalayer/pubsub'
import { UserData } from '../datalayer/user/model'
import { homePageURL } from '../env'
import { SaveErrorCode, SaveResult, SaveUrlInput } from '../generated/graphql'
import { DataModels } from '../resolvers/types'
import { createPageSaveRequest } from './create_page_save_request'
import { ArticleSavingRequestStatus } from '../elastic/types'
import { createLabels } from './labels'

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
    // save state
    const archivedAt =
      input.state === ArticleSavingRequestStatus.Archived ? new Date() : null
    // add labels to page
    const labels = input.labels
      ? await createLabels({ ...ctx, uid: saver.id }, input.labels)
      : undefined

    const pageSaveRequest = await createPageSaveRequest({
      userId: saver.id,
      url: input.url,
      pubsub: ctx.pubsub,
      articleSavingRequestId: input.clientRequestId,
      archivedAt,
      labels,
    })

    return {
      clientRequestId: pageSaveRequest.id,
      url: `${homePageURL()}/${saver.profile.username}/links/${
        pageSaveRequest.id
      }`,
    }
  } catch (error) {
    console.log('error enqueuing request', error)
    return {
      errorCodes: [SaveErrorCode.Unknown],
    }
  }
}
