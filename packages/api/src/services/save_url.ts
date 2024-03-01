import { User } from '../entity/user'
import { homePageURL } from '../env'
import { SaveErrorCode, SaveResult, SaveUrlInput } from '../generated/graphql'
import { userRepository } from '../repository/user'
import { logger } from '../utils/logger'
import { createPageSaveRequest } from './create_page_save_request'

export const saveUrl = async (
  input: SaveUrlInput,
  user: User
): Promise<SaveResult> => {
  try {
    const pageSaveRequest = await createPageSaveRequest({
      ...input,
      user,
      articleSavingRequestId: input.clientRequestId,
      state: input.state || undefined,
      labels: input.labels || undefined,
      locale: input.locale || undefined,
      timezone: input.timezone || undefined,
      savedAt: input.savedAt ? new Date(input.savedAt) : undefined,
      publishedAt: input.publishedAt ? new Date(input.publishedAt) : undefined,
      folder: input.folder || undefined,
    })

    return {
      clientRequestId: pageSaveRequest.id,
      url: `${homePageURL()}/${user.profile.username}/links/${
        pageSaveRequest.id
      }`,
    }
  } catch (error) {
    logger.info('error enqueuing request', error)
    return {
      __typename: 'SaveError',
      errorCodes: [SaveErrorCode.Unknown],
    }
  }
}

export const saveUrlFromEmail = async (
  url: string,
  clientRequestId: string,
  userId: string
): Promise<boolean> => {
  const user = await userRepository.findById(userId)
  if (!user) {
    return false
  }

  const result = await saveUrl(
    {
      url,
      clientRequestId,
      source: 'email',
    },
    user
  )
  if (result.__typename === 'SaveError') {
    return false
  }

  return true
}
