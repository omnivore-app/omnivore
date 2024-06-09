import { gql } from 'graphql-request'
import useSWRInfinite from 'swr/infinite'
import { Highlight, highlightFragment } from '../fragments/highlightFragment'
import { gqlFetcher } from '../networkHelpers'
import { PageInfo } from './useGetLibraryItemsQuery'

interface HighlightsResponse {
  data?: Array<HighlightsData>
  error?: unknown
  isLoading: boolean
  isValidating: boolean
  size: number
  setSize: (
    size: number | ((_size: number) => number)
  ) => Promise<unknown[] | undefined>
  mutate: () => void
}

interface HighlightsVariables {
  first?: number
  query?: string
}

interface HighlightEdge {
  node: Highlight
  cursor: string
}

interface HighlightsData {
  highlights: {
    edges: Array<HighlightEdge>
    pageInfo: PageInfo
    errorCodes?: Array<string>
  }
}

export const useGetHighlights = (
  variables: HighlightsVariables
): HighlightsResponse => {
  const query = gql`
    query Highlights($first: Int, $after: String, $query: String) {
      highlights(first: $first, after: $after, query: $query) {
        ... on HighlightsSuccess {
          edges {
            node {
              ...HighlightFields
              libraryItem {
                id
                title
                author
                slug
              }
            }
            cursor
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
        }
        ... on HighlightsError {
          errorCodes
        }
      }
    }
    ${highlightFragment}
  `

  const getKey = (pageIndex: number, previousPageData: any) => {
    if (previousPageData && !previousPageData.highlights.edges) return null

    if (pageIndex === 0) return '0'

    return previousPageData.highlights.pageInfo.endCursor
  }

  const fetcher = async (cursor: string | null) =>
    gqlFetcher(query, { ...variables, after: cursor }, true)

  const { data, error, isValidating, mutate, size, setSize } = useSWRInfinite(
    getKey,
    fetcher,
    { revalidateFirstPage: false }
  )

  let responseError = error
  let responsePages = data as Array<HighlightsData> | undefined

  // We need to check the response errors here and return the error
  // it will be nested in the data pages, if there is one error,
  // we invalidate the data and return the error. We also zero out
  // the response in the case of an error.
  if (!error && responsePages) {
    const errors = responsePages.filter(
      (d) => d.highlights.errorCodes && d.highlights.errorCodes.length > 0
    )
    if (errors?.length > 0) {
      responseError = errors
      responsePages = undefined
    }
  }

  return {
    isValidating,
    data: responsePages || undefined,
    error: responseError,
    isLoading: !error && !data,
    size,
    setSize,
    mutate,
  }
}
