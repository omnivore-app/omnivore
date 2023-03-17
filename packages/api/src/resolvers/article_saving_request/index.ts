/* eslint-disable prefer-const */
import { getPageByParam } from '../../elastic/pages'
import { env } from '../../env'
import {
  ArticleSavingRequestError,
  ArticleSavingRequestErrorCode,
  ArticleSavingRequestStatus,
  ArticleSavingRequestSuccess,
  CreateArticleSavingRequestError,
  CreateArticleSavingRequestErrorCode,
  CreateArticleSavingRequestSuccess,
  MutationCreateArticleSavingRequestArgs,
  QueryArticleSavingRequestArgs,
} from '../../generated/graphql'
import { createPageSaveRequest } from '../../services/create_page_save_request'
import { analytics } from '../../utils/analytics'
import {
  authorized,
  isParsingTimeout,
  pageToArticleSavingRequest,
} from '../../utils/helpers'
import { isErrorWithCode } from '../user'

export const createArticleSavingRequestResolver = authorized<
  CreateArticleSavingRequestSuccess,
  CreateArticleSavingRequestError,
  MutationCreateArticleSavingRequestArgs
>(async (_, { input: { url } }, { models, claims, pubsub }) => {
  analytics.track({
    userId: claims.uid,
    event: 'link_saved',
    properties: {
      url: url,
      method: 'article_saving_request',
      env: env.server.apiEnv,
    },
  })

  try {
    const request = await createPageSaveRequest(claims.uid, url, models, pubsub)
    return {
      articleSavingRequest: request,
    }
  } catch (err) {
    console.log('error saving article', err)
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
>(async (_, { url }, { models, claims }) => {
  const page = await getPageByParam({ url, userId: claims.uid })
  if (!page) {
    return { errorCodes: [ArticleSavingRequestErrorCode.NotFound] }
  }
  const user = await models.user.get(page.userId)
  if (user && page) {
    if (isParsingTimeout(page)) {
      page.state = ArticleSavingRequestStatus.Succeeded
    }
    return { articleSavingRequest: pageToArticleSavingRequest(user, page) }
  }

  return { errorCodes: [ArticleSavingRequestErrorCode.NotFound] }
})
