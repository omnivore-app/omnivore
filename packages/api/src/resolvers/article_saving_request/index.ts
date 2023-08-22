/* eslint-disable prefer-const */
import { getPageByParam } from '../../elastic/pages'
import { getRepository } from '../../entity'
import { User } from '../../entity/user'
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
  cleanUrl,
  isParsingTimeout,
  pageToArticleSavingRequest,
} from '../../utils/helpers'
import { isErrorWithCode } from '../user'

export const createArticleSavingRequestResolver = authorized<
  CreateArticleSavingRequestSuccess,
  CreateArticleSavingRequestError,
  MutationCreateArticleSavingRequestArgs
>(async (_, { input: { url } }, { claims, pubsub, log }) => {
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
    const request = await createPageSaveRequest({
      userId: claims.uid,
      url,
      pubsub,
    })
    return {
      articleSavingRequest: request,
    }
  } catch (err) {
    log.error('error saving article', err)
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
>(async (_, { id, url }, { claims }) => {
  if (!id && !url) {
    return { errorCodes: [ArticleSavingRequestErrorCode.BadData] }
  }
  const user = await getRepository(User).findOne({
    where: { id: claims.uid },
    relations: ['profile'],
  })
  if (!user) {
    return { errorCodes: [ArticleSavingRequestErrorCode.Unauthorized] }
  }

  const normalizedUrl = url ? cleanUrl(url) : undefined

  const params = {
    _id: id || undefined,
    url: normalizedUrl,
    userId: claims.uid,
    state: [
      ArticleSavingRequestStatus.Succeeded,
      ArticleSavingRequestStatus.Processing,
    ],
  }
  const page = await getPageByParam(params)
  if (!page) {
    return { errorCodes: [ArticleSavingRequestErrorCode.NotFound] }
  }
  if (isParsingTimeout(page)) {
    page.state = ArticleSavingRequestStatus.Succeeded
  }
  return { articleSavingRequest: pageToArticleSavingRequest(user, page) }
})
