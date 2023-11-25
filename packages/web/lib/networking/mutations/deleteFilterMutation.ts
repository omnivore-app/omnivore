import { gql } from 'graphql-request'
import { gqlFetcher } from '../networkHelpers'
import { SavedSearch } from '../fragments/savedSearchFragment'

export type DeleteFilterInput = string

type DeleteFilterOutput = {
  deleteFilter: { filter: SavedSearch }
}

export async function deleteFilterMutation (
  id: DeleteFilterInput
): Promise<SavedSearch | undefined> {
  const mutation = gql`
    mutation DeleteFilter($id: ID!) {
      deleteFilter(id: $id) {
        ... on DeleteFilterSuccess {
          filter {
            id
          }
        }
        ... on DeleteFilterError {
          errorCodes
        }
      }
    }
  `

  try {
    const data = await gqlFetcher(mutation, { id })
    const output = data as DeleteFilterOutput | undefined
    return output?.deleteFilter.filter
  } catch {
    return undefined
  }
}
