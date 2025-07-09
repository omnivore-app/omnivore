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
import { Merge } from '../../util'
import { analytics } from '../../utils/analytics'
import { authorized } from '../../utils/gql-utils'
import { cleanUrl, isParsingTimeout } from '../../utils/helpers'
import { isErrorWithCode } from '../user'

export const createArticleSavingRequestResolver = authorized<
  Merge<
    CreateArticleSavingRequestSuccess,
    { articleSavingRequest: LibraryItem }
  >,
  CreateArticleSavingRequestError,
  MutationCreateArticleSavingRequestArgs
>(async (_, { input: { url } }, { uid, pubsub, log }) => {
  analytics.capture({
    distinctId: uid,
    event: 'link_saved',
    properties: {
      url: url,
      method: 'article_saving_request',
      env: env.server.apiEnv,
    },
  })

  const user = await userRepository.findById(uid)
  if (!user) {
    return { errorCodes: [CreateArticleSavingRequestErrorCode.Unauthorized] }
  }

  try {
    const articleSavingRequest = await createPageSaveRequest({
      user,
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
  Merge<ArticleSavingRequestSuccess, { articleSavingRequest: LibraryItem }>,
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
      libraryItem = await findLibraryItemById(id, uid, {
        select: [
          'id',
          'state',
          'originalUrl',
          'slug',
          'title',
          'author',
          'createdAt',
          'updatedAt',
          'savedAt',
        ],
        relations: {
          user: true,
        },
      })
    } else if (url) {
      libraryItem = await findLibraryItemByUrl(cleanUrl(url), uid)
    }

    if (!libraryItem) {
      return { errorCodes: [ArticleSavingRequestErrorCode.NotFound] }
    }

    // Handle processing timeouts - if item has been processing for too long, retry
    if (isParsingTimeout(libraryItem)) {
      try {
        // Retry the content fetch for stuck items
        await createPageSaveRequest({
          user: libraryItem.user,
          url: libraryItem.originalUrl,
          articleSavingRequestId: libraryItem.id,
          priority: 'high',
        })

        log.info('Retrying content fetch for stuck item', {
          itemId: libraryItem.id,
          url: libraryItem.originalUrl,
        })
      } catch (error) {
        log.error('Failed to retry content fetch for stuck item', {
          error,
          itemId: libraryItem.id,
        })
        // Continue with marking as succeeded to avoid infinite processing
        libraryItem.state = LibraryItemState.Succeeded
      }
    }

    return {
      articleSavingRequest: libraryItem,
    }
  } catch (error) {
    log.error('articleSavingRequestResolver error', error)
    return { errorCodes: [ArticleSavingRequestErrorCode.NotFound] }
  }
})
