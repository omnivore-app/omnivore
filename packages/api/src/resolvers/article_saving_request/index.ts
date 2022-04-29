/* eslint-disable prefer-const */
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
import { authorized, pageToArticleSavingRequest } from '../../utils/helpers'
import { createPageSaveRequest } from '../../services/create_page_save_request'
import { createIntercomEvent } from '../../utils/intercom'
import { getPageById } from '../../elastic/pages'
import { isErrorWithCode } from '../user'

export const createArticleSavingRequestResolver = authorized<
  CreateArticleSavingRequestSuccess,
  CreateArticleSavingRequestError,
  MutationCreateArticleSavingRequestArgs
>(async (_, { input: { url } }, { models, claims, pubsub }) => {
  await createIntercomEvent('link-save-request', claims.uid)
  try {
    const request = await createPageSaveRequest(claims.uid, url, models, pubsub)
    return {
      articleSavingRequest: request,
    }
  } catch (err) {
    console.log('error', err)
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
>(async (_, { id }, { models }) => {
  let page
  let user
  try {
    page = await getPageById(id)
    if (!page) {
      return { errorCodes: [ArticleSavingRequestErrorCode.NotFound] }
    }
    user = await models.user.get(page.userId)
    // eslint-disable-next-line no-empty
  } catch (error) {}
  if (user && page)
    return { articleSavingRequest: pageToArticleSavingRequest(user, page) }

  return { errorCodes: [ArticleSavingRequestErrorCode.NotFound] }
})
