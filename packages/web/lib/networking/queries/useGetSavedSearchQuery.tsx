import { gql } from 'graphql-request'
import useSWR from 'swr'
import { publicGqlFetcher } from '../networkHelpers'
import {
  SavedSearch,
  savedSearchFragment,
} from '../fragments/savedSearchFragment'

type SavedSearchResponse = {
  savedSearches?: SavedSearch[]
  savedSearchErrors?: unknown
  isLoading: boolean
}

type SavedSearchResponseData = {
  filters: { filters: SavedSearch[] }
}

export function useGetSavedSearchQuery(): SavedSearchResponse {
  const query = gql`
    query SavedSearches {
      filters {
        ... on FiltersSuccess {
          filters {
            ...FiltersFragment
          }
        }
        ... on FiltersError {
          errorCodes
        }
      }
    }
    ${savedSearchFragment}
  `

  const { data, error } = useSWR(query, publicGqlFetcher)

  if (data) {
    const { filters } = data as SavedSearchResponseData

    return {
      savedSearches: filters?.filters ?? [],
      savedSearchErrors: error ?? {},
      isLoading: false,
    }
  }

  return {
    savedSearches: [],
    savedSearchErrors: null,
    isLoading: !error && !data,
  }
}
