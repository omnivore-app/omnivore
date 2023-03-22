import normalizeUrl from 'normalize-url'
import * as privateIpLib from 'private-ip'
import { v4 as uuidv4 } from 'uuid'
import { createPubSubClient, PubsubClient } from '../datalayer/pubsub'
import {
  countByCreatedAt,
  createPage,
  getPageByParam,
  updatePage,
} from '../elastic/pages'
import { ArticleSavingRequestStatus, Label, PageType } from '../elastic/types'
import { User } from '../entity/user'
import { getRepository } from '../entity/utils'
import {
  ArticleSavingRequest,
  CreateArticleSavingRequestErrorCode,
} from '../generated/graphql'
import { enqueueParseRequest } from '../utils/createTask'
import { generateSlug, pageToArticleSavingRequest } from '../utils/helpers'

interface PageSaveRequest {
  userId: string
  url: string
  pubsub?: PubsubClient
  articleSavingRequestId?: string
  archivedAt?: Date | null
  labels?: Label[]
  priority?: 'low' | 'high'
}

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

export const createPageSaveRequest = async ({
  userId,
  url,
  pubsub = createPubSubClient(),
  articleSavingRequestId = uuidv4(),
  archivedAt,
  priority,
  labels,
}: PageSaveRequest): Promise<ArticleSavingRequest> => {
  try {
    validateUrl(url)
  } catch (error) {
    console.log('invalid url', url, error)
    return Promise.reject({
      errorCode: CreateArticleSavingRequestErrorCode.BadData,
    })
  }

  const user = await getRepository(User).findOne({
    where: { id: userId },
    relations: ['profile'],
  })
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

  const ctx = {
    pubsub,
    uid: userId,
  }
  let page = await getPageByParam({
    userId,
    url: normalizedUrl,
  })
  if (!page) {
    console.log('Page not exists', normalizedUrl)
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
      url: normalizedUrl,
      state: ArticleSavingRequestStatus.Processing,
      createdAt: new Date(),
      savedAt: new Date(),
      archivedAt,
      labels,
    }

    // create processing page
    const pageId = await createPage(page, ctx)
    if (!pageId) {
      console.log('Failed to create page', page)
      return Promise.reject({
        errorCode: CreateArticleSavingRequestErrorCode.BadData,
      })
    }
  }
  // reset state to processing
  if (page.state !== ArticleSavingRequestStatus.Processing) {
    await updatePage(
      page.id,
      {
        state: ArticleSavingRequestStatus.Processing,
      },
      ctx
    )
  }
  const labelsInput = labels?.map((label) => ({
    name: label.name,
    color: label.color,
    description: label.description,
  }))
  // enqueue task to parse page
  await enqueueParseRequest({
    url,
    userId,
    saveRequestId: page.id,
    priority,
    state: archivedAt ? ArticleSavingRequestStatus.Archived : undefined,
    labels: labelsInput,
  })

  return pageToArticleSavingRequest(user, page)
}
