import { gql } from 'graphql-request'
import { gqlFetcher } from '../networkHelpers'
import { LibraryItemsData } from './useGetLibraryItemsQuery'

export type LibraryItemsQueryInput = {
  limit?: number
  searchQuery?: string
}

export type TypeaheadSearchItemsData = {
  typeaheadSearch: SearchItems
}

export type SearchItems = {
  items: SearchItem[]
}

export type SearchItem = {
  id: string
  title: string
  slug: string
}

export async function typeaheadSearchQuery({
  limit = 10,
  searchQuery,
}: LibraryItemsQueryInput): Promise<TypeaheadSearchItemsData | undefined> {
    const query = gql`
    query TypeaheadSearch($query: String!, $size: Int) {
      typeaheadSearch(query: $query, size: $size) {
        ... on TypeaheadSearchSuccess {
          items {
            id
            title
            slug
          }
        }
        ... on TypeaheadSearchError {
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
    return data as TypeaheadSearchItemsData || undefined;
  } catch (error) {
    console.log('search error', error)
    return undefined
  }
}
