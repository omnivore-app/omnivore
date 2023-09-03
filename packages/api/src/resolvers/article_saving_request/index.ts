/* eslint-disable prefer-const */
import { LibraryItem, LibraryItemState } from '../../entity/library_item'
import { env } from '../../env'
import {
  ArticleSavingRequestError,
  ArticleSavingRequestErrorCode,
  ArticleSavingRequestSuccess,
  CreateArticleSavingRequestError,
  CreateArticleSavingRequestErrorCode,
  CreateArticleSavingRequestSuccess,
  MutationCreateArticleSavingRequestArgs,
  QueryArticleSavingRequestArgs,
} from '../../generated/graphql'
import { userRepository } from '../../repository/user'
import { createPageSaveRequest } from '../../services/create_page_save_request'
import {
  findLibraryItemById,
  findLibraryItemByUrl,
} from '../../services/library_item'
import { analytics } from '../../utils/analytics'
import {
  authorized,
  cleanUrl,
  isParsingTimeout,
  libraryItemToArticleSavingRequest,
} from '../../utils/helpers'
import { isErrorWithCode } from '../user'

export const createArticleSavingRequestResolver = authorized<
  CreateArticleSavingRequestSuccess,
  CreateArticleSavingRequestError,
  MutationCreateArticleSavingRequestArgs
>(async (_, { input: { url } }, { uid, pubsub, log }) => {
  analytics.track({
    userId: uid,
    event: 'link_saved',
    properties: {
      url: url,
      method: 'article_saving_request',
      env: env.server.apiEnv,
    },
  })

  try {
    const articleSavingRequest = await createPageSaveRequest({
      userId: uid,
      url,
      pubsub,
    })
    return {
      articleSavingRequest,
    }
  } catch (err) {
    log.error('createArticleSavingRequestResolver error', err)
    if (isErrorWithCode(err)) {
      return {
        errorCodes: [err.errorCode as CreateArticleSavingRequestErrorCode],
      }
    }
    return { errorCodes: [CreateArticleSavingRequestErrorCode.BadData] }
  }
})

export const articleSavingRequestResolver = authorized<
  ArticleSavingRequestSuccess,
  ArticleSavingRequestError,
  QueryArticleSavingRequestArgs
>(async (_, { id, url }, { uid, log }) => {
  try {
    if (!id && !url) {
      return { errorCodes: [ArticleSavingRequestErrorCode.BadData] }
    }
    const user = await userRepository.findById(uid)
    if (!user) {
      return { errorCodes: [ArticleSavingRequestErrorCode.Unauthorized] }
    }

    let libraryItem: LibraryItem | null = null
    if (id) {
      libraryItem = await findLibraryItemById(id, uid)
    } else if (url) {
      libraryItem = await findLibraryItemByUrl(cleanUrl(url), uid)
    }

    if (!libraryItem) {
      return { errorCodes: [ArticleSavingRequestErrorCode.NotFound] }
    }
    if (isParsingTimeout(libraryItem)) {
      libraryItem.state = LibraryItemState.Succeeded
    }
    return {
      articleSavingRequest: libraryItemToArticleSavingRequest(
        user,
        libraryItem
      ),
    }
  } catch (error) {
    log.error('articleSavingRequestResolver error', error)
    return { errorCodes: [ArticleSavingRequestErrorCode.Unauthorized] }
  }
})
