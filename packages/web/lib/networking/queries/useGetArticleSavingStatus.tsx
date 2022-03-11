import { gql } from 'graphql-request'
import useSWR from 'swr'
import { articleFragment } from '../fragments/articleFragment'
import { highlightFragment } from '../fragments/highlightFragment'
import { makeGqlFetcher } from '../networkHelpers'
import { ArticleAttributes } from './useGetArticleQuery'

type ArticleSavingStatusInput = {
  id: string
}

type ArticleSavingStatusResponse = {
  successRedirectPath?: string
  article?: ArticleAttributes
  error?: ArticleSavingStatusError
}

type ResponseData = {
  articleSavingRequest?: ArticleSavingRequest
}

type ArticleSavingRequest = {
  articleSavingRequest?: ArticleSavingRequestData
  errorCodes?: string[]
}

type ArticleSavingRequestData = {
  id?: string
  status?: string
  errorCode?: string
  user?: UserData
  article?: ArticleAttributes
}

type UserData = {
  profile: UserProfile
}

type UserProfile = {
  username: string
}

type ArticleSavingStatusError =
  | 'timeout'
  | 'failed'
  | 'server-error'
  | 'unauthorized'

export function useGetArticleSavingStatus({
  id,
}: ArticleSavingStatusInput): ArticleSavingStatusResponse {
  const query = gql`
    query ArticleSavingRequest($id: ID!) {
      articleSavingRequest(id: $id) {
        ... on ArticleSavingRequestSuccess {
          articleSavingRequest {
            id
            status
            errorCode
            user {
              id
              profile {
                id
                username
              }
            }
            article {
              ...ArticleFields
              content
              shareInfo {
                title
                description
              }
              highlights(input: { includeFriends: false }) {
                ...HighlightFields
              }
            }
          }
        }
        ... on ArticleSavingRequestError {
          errorCodes
        }
      }
    }
    ${articleFragment}
    ${highlightFragment}
  `

  // poll twice a second
  const { data, error } = useSWR([query, id], makeGqlFetcher({ id }), {
    refreshInterval: 500,
  })

  if (error) {
    return { error }
  }

  if (!data) {
    return {}
  }

  const { articleSavingRequest } = data as ResponseData

  if (
    articleSavingRequest?.errorCodes?.find(
      (errorCode) => errorCode === 'UNAUTHORIZED'
    )
  ) {
    return {
      error: 'unauthorized',
    }
  }

  const status = articleSavingRequest?.articleSavingRequest?.status

  if (status === 'SUCCEEDED') {
    const username =
      articleSavingRequest?.articleSavingRequest?.user?.profile?.username
    const slug = articleSavingRequest?.articleSavingRequest?.article?.slug
    if (username && slug) {
      return { successRedirectPath: `/${username}/${slug}`, article: articleSavingRequest?.articleSavingRequest?.article }
    } else {
      return { successRedirectPath: `/home` }
    }
  }

  if (status === 'PROCESSING') {
    return {}
  }

  if (status === 'FAILED') {
    return { error: 'failed' }
  }

  const errorCode = articleSavingRequest?.articleSavingRequest?.errorCode
  if (errorCode) {
    return { error: 'server-error' }
  }

  return { error: 'server-error' }
}
