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
import { Page, PageType, State } from '../elastic/types'
import { createPubSubClient, PubsubClient } from '../datalayer/pubsub'

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

  const createdTaskName = await enqueueParseRequest(
    url,
    userId,
    articleSavingRequestId,
    priority
  )

  const existingPage = await getPageByParam({
    userId,
    url,
    state: State.Succeeded,
  })
  if (existingPage) {
    console.log('Page already exists', url)
    existingPage.taskName = createdTaskName
    return pageToArticleSavingRequest(user, existingPage)
  }

  const page: Page = {
    id: articleSavingRequestId,
    userId,
    content: 'Your link is being saved...',
    createdAt: new Date(),
    hash: '',
    pageType: PageType.Unknown,
    readingProgressAnchorIndex: 0,
    readingProgressPercent: 0,
    slug: generateSlug(url),
    title: url,
    url,
    taskName: createdTaskName,
    state: State.Processing,
    description: 'Your link is being saved...',
  }

  const pageId = await createPage(page, { pubsub, uid: userId })
  if (!pageId) {
    console.log('Failed to create page', page)
    return Promise.reject({
      errorCode: CreateArticleSavingRequestErrorCode.BadData,
    })
  }

  return pageToArticleSavingRequest(user, page)
}
