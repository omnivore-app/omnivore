import { v4 as uuidv4 } from 'uuid'
import { enqueueParseRequest } from '../utils/createTask'

// TODO: switch to a proper Entity instead of using the old data models.
import { DataModels } from '../resolvers/types'
import {
  ArticleSavingRequest,
  CreateArticleSavingRequestErrorCode,
} from '../generated/graphql'
import { generateSlug, pageToArticleSavingRequest } from '../utils/helpers'
import * as privateIpLib from 'private-ip'
import { countByCreatedAt, createPage, getPageByParam } from '../elastic/pages'
import { ArticleSavingRequestStatus, PageType } from '../elastic/types'
import { createPubSubClient, PubsubClient } from '../datalayer/pubsub'
import normalizeUrl from 'normalize-url'

const SAVING_CONTENT = 'Your link is being saved...'

const isPrivateIP = privateIpLib.default

// 5 articles added in the last minute: use low queue
// default: use normal queue
const getPriorityByRateLimit = async (
  userId: string
): Promise<'low' | 'high'> => {
  const count = await countByCreatedAt(userId, Date.now() - 60 * 1000)
  return count >= 5 ? 'low' : 'high'
}

export const validateUrl = (url: string): URL => {
  const u = new URL(url)
  // Make sure the URL is http or https
  if (u.protocol !== 'http:' && u.protocol !== 'https:') {
    throw new Error('Invalid URL')
  }
  // Make sure the domain is not localhost
  if (u.hostname === 'localhost' || u.hostname === '0.0.0.0') {
    throw new Error('Invalid URL')
  }
  // Make sure its not a private GCP domain
  if (
    u.hostname == 'metadata.google.internal' ||
    /^169.254.*/.test(u.hostname)
  ) {
    throw new Error('Invalid URL')
  }
  // // Make sure the domain is not a private IP
  // if (/^(10|172\.16|192\.168)\..*/.test(u.hostname)) {
  //   throw new Error('Invalid URL')
  // }
  if (isPrivateIP(u.hostname)) {
    throw new Error('Invalid URL')
  }
  return u
}

export const createPageSaveRequest = async (
  userId: string,
  url: string,
  models: DataModels,
  pubsub: PubsubClient = createPubSubClient(),
  articleSavingRequestId = uuidv4(),
  priority?: 'low' | 'high'
): Promise<ArticleSavingRequest> => {
  try {
    validateUrl(url)
  } catch (error) {
    console.log('invalid url', url, error)
    return Promise.reject({
      errorCode: CreateArticleSavingRequestErrorCode.BadData,
    })
  }

  const user = await models.user.get(userId)
  if (!user) {
    console.log('User not found', userId)
    return Promise.reject({
      errorCode: CreateArticleSavingRequestErrorCode.BadData,
    })
  }

  // get priority by checking rate limit if not specified
  priority = priority || (await getPriorityByRateLimit(userId))

  // look for existing page
  const normalizedUrl = normalizeUrl(url, {
    stripHash: true,
    stripWWW: false,
  })

  let page = await getPageByParam({
    userId,
    url: normalizedUrl,
  })
  if (page) {
    console.log('Page already exists', page)
    articleSavingRequestId = page.id
  } else {
    page = {
      id: articleSavingRequestId,
      userId,
      content: SAVING_CONTENT,
      hash: '',
      pageType: PageType.Unknown,
      readingProgressAnchorIndex: 0,
      readingProgressPercent: 0,
      slug: generateSlug(url),
      title: url,
      url,
      state: ArticleSavingRequestStatus.Processing,
      createdAt: new Date(),
      savedAt: new Date(),
    }

    // create processing page
    const pageId = await createPage(page, { pubsub, uid: userId })
    if (!pageId) {
      console.log('Failed to create page', page)
      return Promise.reject({
        errorCode: CreateArticleSavingRequestErrorCode.BadData,
      })
    }
  }

  // enqueue task to parse page
  await enqueueParseRequest(url, userId, articleSavingRequestId, priority)

  return pageToArticleSavingRequest(user, page)
}
