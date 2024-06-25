import { gql } from 'graphql-request'
import useSWR from 'swr'
import { gqlFetcher, makeGqlFetcher, publicGqlFetcher } from '../networkHelpers'

type HomeResult = {
  home: {
    edges?: HomeEdge[]
    errorCodes?: string[]
  }
}

export type HomeItemResponse = {
  error: boolean
  isValidating: boolean
  errorMessage?: string
  sections?: HomeSection[]
  mutate?: () => void
}

export type HomeItem = {
  id: string
  date: string
  title: string
  url: string
  slug: string
  score: number
  source: HomeItemSource

  previewContent?: string
  wordCount?: number

  author?: string
  broadcastCount?: number
  canArchive?: boolean
  canComment?: boolean
  canDelete?: boolean
  canSave?: boolean
  canMove?: boolean
  canShare?: boolean
  dir?: string

  likeCount?: number
  saveCount?: number
  seen_at?: string
  thumbnail?: string
}

export type HomeItemSourceType =
  | 'LIBRARY'
  | 'NEWSLETTER'
  | 'RECOMMENDATION'
  | 'RSS'

export type HomeItemSource = {
  name: string
  type: HomeItemSourceType
  id?: string
  icon?: string
  url?: string
}

export type HomeSection = {
  title: string
  layout: string
  items: HomeItem[]
  thumbnail?: string
}

type HomeEdge = {
  cursor: string
  node: HomeSection
}

export function useGetHomeItems(): HomeItemResponse {
  const query = gql`
    query GetHomeItems($after: String, $first: Int) {
      home(first: $first, after: $after) {
        ... on HomeSuccess {
          edges {
            cursor
            node {
              title
              layout
              thumbnail
              items {
                id
                title
                url
                slug
                score
                thumbnail
                previewContent
                saveCount
                likeCount
                broadcastCount
                date
                author
                dir
                seen_at
                wordCount
                source {
                  id
                  name
                  url
                  icon
                  type
                }
                canSave
                canMove
                canComment
                canShare
                canArchive
                canDelete
              }
            }
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
            totalCount
          }
        }
        ... on HomeError {
          errorCodes
        }
      }
    }
  `

  const variables = {
    first: 100,
    after: null,
  }

  const { data, error, isValidating, mutate } = useSWR(
    [query, variables.first, variables.after],
    makeGqlFetcher(query, variables),
    {}
  )

  if (error) {
    return {
      error: true,
      isValidating,
      errorMessage: error.toString(),
    }
  }

  const result = data as HomeResult
  if (result && result.home.errorCodes) {
    const errorCodes = result.home.errorCodes
    return {
      error: true,
      isValidating,
      errorMessage: errorCodes.length > 0 ? errorCodes[0] : undefined,
    }
  }

  if (result && result.home && result.home.edges) {
    return {
      mutate,
      error: false,
      isValidating,
      sections: result.home.edges.map((edge) => {
        return edge.node
      }),
    }
  }

  return {
    isValidating,
    error: !!error,
  }
}
