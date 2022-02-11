import { v4 as uuidv4 } from 'uuid'
import { enqueueParseRequest } from '../utils/createTask'

// TODO: switch to a proper Entity instead of using the old data models.
import { DataModels } from '../resolvers/types'
import {
  ArticleSavingRequest,
  CreateArticleSavingRequestErrorCode,
} from '../generated/graphql'
import { articleSavingRequestDataToArticleSavingRequest } from '../utils/helpers'
import * as privateIpLib from 'private-ip'

const isPrivateIP = privateIpLib.default

export const validateUrl = (url: string) => {
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
}

export const createPageSaveRequest = async (
  userId: string,
  url: string,
  models: DataModels,
  priority: 'low' | 'high' = 'high',
  articleSavingRequestId = uuidv4()
): Promise<ArticleSavingRequest> => {
  try {
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
    // Make sure the domain is not a private IP
    if (/^(10|172\.16|192\.168)\..*/.test(u.hostname)) {
      throw new Error('Invalid URL')
    }
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

  const createdTaskName = await enqueueParseRequest(
    url,
    userId,
    articleSavingRequestId,
    priority
  )

  const articleSavingRequestData = await models.articleSavingRequest.create({
    userId: userId,
    taskName: createdTaskName,
    id: articleSavingRequestId,
  })

  return articleSavingRequestDataToArticleSavingRequest(
    user,
    articleSavingRequestData
  )
}
