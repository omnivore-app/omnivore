import { gql } from 'graphql-request'
import { gqlFetcher } from '../networkHelpers'
import { SavedSearch } from '../fragments/savedSearchFragment'

export type UpdateFilterInput = {
  id?: string
  name?: string
  filter?: string
  position?: number
  category?: string
  description?: string
  visible?: boolean
}

type UpdateFilterOutput = {
  filter: SavedSearch
}

export async function updateFilterMutation (
  input: UpdateFilterInput
): Promise<string | undefined> {
  const mutation = gql`
    mutation UpdateFilter($input: UpdateFilterInput!) {
      updateFilter(input: $input) {
        ... on UpdateFilterSuccess {
          filter {
            id
          }
        }

        ... on UpdateFilterError {
          errorCodes
        }
      }
    }
  `

  try {
    const { id, name, visible, filter, position } = input
    const data = await gqlFetcher(mutation, { input: {id, name, filter, position, visible }})
    const output = data as UpdateFilterOutput | undefined
    return output?.filter?.id
  } catch {
    return undefined
  }
}
