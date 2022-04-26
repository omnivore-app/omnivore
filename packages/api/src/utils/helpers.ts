/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  ArticleSavingRequest,
  ArticleSavingRequestStatus,
  CreateArticleError,
  CreateArticleErrorCode,
  FeedArticle,
  Profile,
  ResolverFn,
} from '../generated/graphql'
import { Claims, WithDataSourcesContext } from '../resolvers/types'
import {
  MembershipTier,
  RegistrationType,
  UserData,
} from '../datalayer/user/model'
import crypto from 'crypto'
import slugify from 'voca/slugify'
import { Merge } from '../util'
import { ArticleSavingRequestData } from '../datalayer/article_saving_request/model'
import { CreateArticlesSuccessPartial } from '../resolvers'
import { Page, State } from '../elastic/types'
import { updatePage } from '../elastic/pages'

interface InputObject {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

export const keysToCamelCase = (object: InputObject): InputObject => {
  Object.keys(object).forEach((key) => {
    const parts = key.split('_')
    if (parts.length <= 1) return

    const newKey =
      parts[0] +
      parts
        .slice(1)
        .map((p) => p[0].toUpperCase() + p.slice(1))
        .join('')
    delete Object.assign(object, { [newKey]: object[key] })[key]
  })
  return object
}

/**
 * Generates uuid using MD5 hash from the specified string
 * @param str - string to generate UUID from
 * @example
 * // returns "a3dcb4d2-29de-6fde-0db5-686dee47145d"
 * return uuidWithMd5('test')
 */
export const stringToHash = (str: string, convertToUUID = false): string => {
  const md5Hash = crypto.createHash('md5').update(str).digest('hex')
  if (!convertToUUID) return md5Hash
  return (
    md5Hash.substring(0, 8) +
    '-' +
    md5Hash.substring(8, 12) +
    '-' +
    md5Hash.substring(12, 16) +
    '-' +
    md5Hash.substring(16, 20) +
    '-' +
    md5Hash.substring(20)
  ).toLowerCase()
}

export function authorized<
  TSuccess,
  TError extends { errorCodes: string[] },
  /* eslint-disable @typescript-eslint/no-explicit-any */
  TArgs = any,
  TParent = any
  /* eslint-enable @typescript-eslint/no-explicit-any */
>(
  resolver: ResolverFn<
    TSuccess | TError,
    TParent,
    WithDataSourcesContext & { claims: Claims },
    TArgs
  >
): ResolverFn<TSuccess | TError, TParent, WithDataSourcesContext, TArgs> {
  return (parent, args, ctx, info) => {
    const { claims } = ctx
    if (claims?.uid) {
      return resolver(parent, args, { ...ctx, claims }, info)
    }
    return { errorCodes: ['UNAUTHORIZED'] } as TError
  }
}

export const findDelimiter = (
  text: string,
  delimiters = ['\t', ',', ':', ';'],
  defaultDelimiter = '\t'
): string => {
  const textChunk = text
    // remove escaped sections that can contain false-positive delimiters
    .replace(/"(.|\n)*?"/gm, '')
    .split('\n')
    .slice(0, 5)
  const delimiter = delimiters.find((delimiter) =>
    textChunk.every(
      (row, _, array) =>
        row.split(delimiter).length === array[0].split(delimiter).length &&
        row.split(delimiter).length !== 1
    )
  )

  return delimiter || defaultDelimiter
}

// FIXME: Remove this Date stub after nullable types will be fixed
export const userDataToUser = (
  user: Merge<
    UserData,
    {
      isFriend?: boolean
      followersCount?: number
      friendsCount?: number
      sharedArticlesCount?: number
      sharedHighlightsCount?: number
      sharedNotesCount?: number
      viewerIsFollowing?: boolean
    }
  >
): {
  id: string
  name: string
  source: RegistrationType
  membership: MembershipTier
  email?: string | null
  phone?: string | null
  picture?: string | null
  googleId?: string | null
  createdAt: Date
  isFriend?: boolean | null
  isFullUser: boolean
  viewerIsFollowing?: boolean | null
  sourceUserId: string
  friendsCount?: number
  followersCount?: number
  sharedArticles: FeedArticle[]
  sharedArticlesCount?: number
  sharedHighlightsCount?: number
  sharedNotesCount?: number
  profile: Profile
} => ({
  ...user,
  name: user.name,
  source: user.source as RegistrationType,
  membership: user.membership as MembershipTier,
  createdAt: user.createdAt || new Date(),
  friendsCount: user.friendsCount || 0,
  followersCount: user.followersCount || 0,
  isFullUser: isFullUser(user.membership as MembershipTier),
  viewerIsFollowing: user.viewerIsFollowing || user.isFriend || false,
  picture: user.profile.picture_url,
  sharedArticles: [],
  sharedArticlesCount: user.sharedArticlesCount || 0,
  sharedHighlightsCount: user.sharedHighlightsCount || 0,
  sharedNotesCount: user.sharedNotesCount || 0,
  profile: {
    ...user.profile,
    pictureUrl: user.profile.picture_url,
  },
})

export const isFullUser = (membership: MembershipTier): boolean => {
  return membership != MembershipTier.WaitList
}

export const generateSlug = (title: string): string => {
  return slugify(title).substring(0, 64) + '-' + Date.now().toString(16)
}

export const MAX_CONTENT_LENGTH = 5e7 //50MB

export const pageError = async (
  result: CreateArticleError,
  ctx: WithDataSourcesContext,
  pageId?: string | null
): Promise<CreateArticleError | CreateArticlesSuccessPartial> => {
  if (!pageId) return result

  await updatePage(
    pageId,
    {
      state: State.Failed,
    },
    ctx
  )

  return result
}

export const articleSavingRequestError = async (
  result: CreateArticleError,
  ctx: WithDataSourcesContext,
  articleSavingReqest?: ArticleSavingRequestData
): Promise<CreateArticleError | CreateArticlesSuccessPartial> => {
  if (!articleSavingReqest) return result

  await ctx.authTrx((tx) =>
    ctx.models.articleSavingRequest.update(
      articleSavingReqest.id,
      {
        status: ArticleSavingRequestStatus.Failed,
        errorCode: result.errorCodes[0],
      },
      tx
    )
  )

  return result
}

export const articleSavingRequestPopulate = async (
  result: CreateArticlesSuccessPartial,
  ctx: WithDataSourcesContext,
  articleSavingReqestId: string | undefined,
  articleId: string | undefined
): Promise<CreateArticleError | CreateArticlesSuccessPartial> => {
  if (!articleSavingReqestId) return result
  await ctx.authTrx((tx) =>
    ctx.models.articleSavingRequest.update(
      articleSavingReqestId,
      {
        status: ArticleSavingRequestStatus.Succeeded,
        elasticPageId: articleId,
      },
      tx
    )
  )

  return result
}

export const pageToArticleSavingRequest = (
  user: UserData,
  page: Page
): ArticleSavingRequest => ({
  ...page,
  user: userDataToUser(user),
  status: page.state as string as ArticleSavingRequestStatus,
  updatedAt: page.updatedAt || new Date(),
})

export const articleSavingRequestDataToArticleSavingRequest = (
  user: UserData,
  articleSavingRequest: ArticleSavingRequestData
): ArticleSavingRequest => ({
  ...articleSavingRequest,
  user: userDataToUser(user),
  status: articleSavingRequest.status as ArticleSavingRequestStatus,
  errorCode: articleSavingRequest.errorCode as CreateArticleErrorCode,
})

export const validatedDate = (
  date: Date | string | undefined
): Date | undefined => {
  try {
    if (typeof date === 'string') {
      // Sometimes readability returns a string for the date
      date = new Date(date)
    }

    if (!date) return undefined
    // Make sure the date year is not greater than 9999
    if (date.getFullYear() > 9999) {
      return undefined
    }
    return new Date(date)
  } catch (e) {
    console.log('error validating date', date, e)
    return undefined
  }
}
