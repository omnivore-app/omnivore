import { gql } from 'graphql-request'
import { gqlFetcher } from '../networkHelpers'
import { LibraryItemsData } from './useGetLibraryItemsQuery'

export type LibraryItemsQueryInput = {
  limit?: number
  searchQuery?: string
}

export async function searchQuery({
  limit = 10,
  searchQuery,
}: LibraryItemsQueryInput): Promise<LibraryItemsData | undefined> {
    const query = gql`
    query Search($after: String, $first: Int, $query: String) {
      search(first: $first, after: $after, query: $query) {
        ... on SearchSuccess {
          edges {
            cursor
            node {
              id
              title
              slug
              url
              pageType
              contentReader
              createdAt
              isArchived
              readingProgressPercent
              readingProgressAnchorIndex
              author
              image
              description
              publishedAt
              ownedByViewer
              originalArticleUrl
              uploadFileId
              labels {
                id
                name
                color
              }
              pageId
              shortId
              quote
              annotation
              state
              siteName
              subscription
              readAt
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
        ... on SearchError {
          errorCodes
        }
      }
    }
  `

  const variables = {
    first: limit,
    query: searchQuery,
  }

  try {
    const data = (await gqlFetcher(query, {...variables}))
    return data as LibraryItemsData || undefined;
  } catch (error) {
    console.log('search error', error)
    return undefined
  }
}
