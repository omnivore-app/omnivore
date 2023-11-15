import { gql } from 'graphql-request'
import { gqlFetcher } from '../networkHelpers'
import { SavedSearch } from "../fragments/savedSearchFragment"

export type AddFilterInput = {
  name: string
  filter: string
  category: string
  position: number
}

type AddFilterOutput = {
  saveFilter: { filter: SavedSearch }
}

export async function saveFilterMutation (
  input: AddFilterInput
): Promise<SavedSearch | undefined> {
  const mutation = gql`
    mutation SaveFilter($input: SaveFilterInput!) {
      saveFilter(input: $input) {
        ... on SaveFilterSuccess {
          filter {
            id
            name
            filter
            position
            visible
            defaultFilter
          }
        }

        ... on SaveFilterError {
          errorCodes
        }
      }
    }
  `

  const data = await gqlFetcher(mutation, { input })
  const output = data as AddFilterOutput | undefined
  return output?.saveFilter.filter
}
