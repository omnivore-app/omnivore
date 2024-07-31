import { gql } from 'graphql-request'
import { savedSearchFragment } from '../fragments/savedSearchFragment'

export const GQL_GET_SAVED_SEARCHES = gql`
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

export const GQL_DELETE_SAVED_SEARCH = gql`
  mutation DeleteFilter($id: ID!) {
    deleteFilter(id: $id) {
      ... on DeleteFilterSuccess {
        filter {
          ...FiltersFragment
        }
      }
      ... on DeleteFilterError {
        errorCodes
      }
    }
  }
  ${savedSearchFragment}
`

export const GQL_CREATE_SAVED_SEARCH = gql`
  mutation SaveFilter($input: SaveFilterInput!) {
    saveFilter(input: $input) {
      ... on SaveFilterSuccess {
        filter {
          ...FiltersFragment
        }
      }

      ... on SaveFilterError {
        errorCodes
      }
    }
  }
  ${savedSearchFragment}
`

export const GQL_UPDATE_SAVED_SEARCH = gql`
  mutation UpdateFilter($input: UpdateFilterInput!) {
    updateFilter(input: $input) {
      ... on UpdateFilterSuccess {
        filter {
          ...FiltersFragment
        }
      }

      ... on UpdateFilterError {
        errorCodes
      }
    }
  }
  ${savedSearchFragment}
`
