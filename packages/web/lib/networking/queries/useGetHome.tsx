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
}

export type HomeItem = {
  id: string
  date: string
  title: string
  url: string
  source: HomeItemSource

  previewContent?: string
  wordCount?: number

  author?: string
  broadcastCount?: number
  canArchive?: boolean
  canComment?: boolean
  canDelete?: boolean
  canSave?: boolean
  canShare?: boolean
  dir?: string

  likeCount?: number
  saveCount?: number
  seen_at?: string
  thumbnail?: string
}

type HomeItemSourceType = 'LIBRARY' | 'NEWSLETTER' | 'RECOMMENDATION' | 'RSS'

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
    first: 20,
    after: null,
  }

  const { data, error, isValidating } = useSWR(
    [query, variables.first, variables.after],
    makeGqlFetcher(variables)
  )

  if (error) {
    return {
      error: true,
      isValidating,
      errorMessage: error.toString(),
    }
  }

  const result = data as HomeResult
  console.log('result: ', result)

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

// Fake HomeSubscription data
const source1: HomeItemSource = {
  id: 'sub1',
  name: 'Tech News',
  type: 'NEWSLETTER',
  icon: 'https://example.com/icon1.png',
  url: 'https://example.com/tech-news',
}

const source2: HomeItemSource = {
  id: 'sub2',
  name: 'Daily Updates',
  type: 'RSS',
  icon: 'https://example.com/icon2.png',
  url: 'https://example.com/daily-updates',
}

// Fake HomeItem data
export const stubHomeItems: HomeItem[] = [
  {
    id: 'item1',
    date: '2024-05-01',
    title: 'Breaking Tech News',
    url: 'https://example.com/article1',
    source: source1,
    previewContent: 'A brief summary of the tech news...',
    wordCount: 500,
    author: 'John Doe',
    broadcastCount: 10,
    canArchive: true,
    canComment: true,
    canDelete: true,
    canSave: true,
    canShare: true,
    dir: 'ltr',
    likeCount: 100,
    saveCount: 50,
    seen_at: '2024-05-02',
    thumbnail: 'https://example.com/thumbnail1.png',
  },
  {
    id: 'item2',
    date: '2024-05-03',
    title: 'Daily Updates: May 3rd',
    url: 'https://example.com/article2',
    source: source2,
    previewContent: 'A brief summary of the daily updates...',
    wordCount: 300,
    author: 'Jane Smith',
    broadcastCount: 5,
    canArchive: false,
    canComment: true,
    canDelete: false,
    canSave: true,
    canShare: false,
    dir: 'ltr',
    likeCount: 75,
    saveCount: 30,
    seen_at: '2024-05-04',
    thumbnail: 'https://example.com/thumbnail2.png',
  },
  {
    id: 'item3',
    date: '2024-05-05',
    title: 'In-Depth Analysis',
    url: 'https://example.com/article3',
    source: source1,
    wordCount: 1500,
    canArchive: true,
    canComment: true,
    canDelete: true,
    canSave: true,
    canShare: true,
    likeCount: 200,
    saveCount: 120,
    seen_at: '2024-05-06',
  },
]
