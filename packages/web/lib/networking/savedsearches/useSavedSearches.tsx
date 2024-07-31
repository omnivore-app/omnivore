import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { gqlFetcher } from '../networkHelpers'
import {
  GQL_CREATE_SAVED_SEARCH,
  GQL_DELETE_SAVED_SEARCH,
  GQL_GET_SAVED_SEARCHES,
  GQL_UPDATE_SAVED_SEARCH,
} from './gql'
import { SavedSearch } from '../fragments/savedSearchFragment'

export function useGetSavedSearches() {
  return useQuery({
    queryKey: ['filters'],
    queryFn: async () => {
      const response = (await gqlFetcher(
        GQL_GET_SAVED_SEARCHES
      )) as SavedSearchData
      if (response.filters?.errorCodes?.length) {
        throw new Error(response.filters.errorCodes[0])
      }
      return response.filters.filters
    },
  })
}

export const useCreateSavedSearch = () => {
  const queryClient = useQueryClient()
  const createSavedSearch = async (variables: {
    name: string
    filter: string
    category: string
    position: number
  }) => {
    const result = (await gqlFetcher(GQL_CREATE_SAVED_SEARCH, {
      input: {
        name: variables.name,
        filter: variables.filter,
        category: variables.category,
        position: variables.position,
      },
    })) as CreateSavedSearchData
    if (result.saveFilter.errorCodes?.length) {
      throw new Error(result.saveFilter.errorCodes[0])
    }
    return result.saveFilter?.filter
  }
  return useMutation({
    mutationFn: createSavedSearch,
    onSuccess: (newSavedSearch) => {
      const keys = queryClient
        .getQueryCache()
        .findAll({ queryKey: ['filters'] })
      keys.forEach((query) => {
        queryClient.setQueryData(query.queryKey, (data: SavedSearch[]) => {
          return [...data, newSavedSearch]
        })
      })
    },
  })
}

export const useUpdateSavedSearch = () => {
  const queryClient = useQueryClient()
  const updateSavedSearch = async (variables: {
    input: UpdateSavedSearchInput
  }) => {
    const result = (await gqlFetcher(GQL_UPDATE_SAVED_SEARCH, {
      input: {
        id: variables.input.id,
        name: variables.input.name,
        visible: variables.input.visible,
        filter: variables.input.filter,
        position: variables.input.position,
      },
    })) as UpdateSavedSearchData
    if (result.updateFilter.errorCodes?.length) {
      throw new Error(result.updateFilter.errorCodes[0])
    }
    return result.updateFilter?.filter
  }
  return useMutation({
    mutationFn: updateSavedSearch,
    onSuccess: (updatedSavedSearch) => {
      if (updatedSavedSearch) {
        const keys = queryClient
          .getQueryCache()
          .findAll({ queryKey: ['filters'] })
        keys.forEach((query) => {
          queryClient.setQueryData(query.queryKey, (data: SavedSearch[]) => {
            return [
              ...data.filter(
                (savedSearch) => savedSearch.id !== updatedSavedSearch.id
              ),
              updatedSavedSearch,
            ]
          })
        })
      }
    },
  })
}

export const useDeleteSavedSearch = () => {
  const queryClient = useQueryClient()
  const deleteSavedSearch = async (variables: { searchId: string }) => {
    const result = (await gqlFetcher(GQL_DELETE_SAVED_SEARCH, {
      id: variables.searchId,
    })) as DeleteSavedSearchData
    if (result.deleteFilter.errorCodes?.length) {
      throw new Error(result.deleteFilter.errorCodes[0])
    }
    return result.deleteFilter?.filter?.id
  }
  return useMutation({
    mutationFn: deleteSavedSearch,
    onSuccess: (deletedId) => {
      if (deletedId) {
        const keys = queryClient
          .getQueryCache()
          .findAll({ queryKey: ['filters'] })
        keys.forEach((query) => {
          queryClient.setQueryData(query.queryKey, (data: SavedSearch[]) => {
            return data.filter((filter) => filter.id !== deletedId)
          })
        })
      }
    },
  })
}

type UpdateSavedSearchResult = {
  filter?: SavedSearch
  errorCodes?: string[]
}

type UpdateSavedSearchData = {
  updateFilter: UpdateSavedSearchResult
}

type CreateSavedSearchResult = {
  filter?: SavedSearch
  errorCodes?: string[]
}
type CreateSavedSearchData = {
  saveFilter: CreateSavedSearchResult
}

type DeleteSavedSearchResult = {
  filter?: SavedSearch
  errorCodes?: string[]
}
type DeleteSavedSearchData = {
  deleteFilter: DeleteSavedSearchResult
}

type FiltersResult = {
  filters?: SavedSearch[]
  errorCodes?: string[]
}
type SavedSearchData = {
  filters: FiltersResult
}

export type UpdateSavedSearchInput = {
  id?: string
  name?: string
  filter?: string
  position?: number
  category?: string
  description?: string
  visible?: boolean
  folder?: string
}
