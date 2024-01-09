import { gql } from 'graphql-request'
import { gqlFetcher } from '../networkHelpers'

export async function deleteHighlightMutation(
  libraryItemId: string,
  highlightId: string
): Promise<boolean> {
  const mutation = gql`
    mutation DeleteHighlight($highlightId: ID!) {
      deleteHighlight(highlightId: $highlightId) {
        ... on DeleteHighlightSuccess {
          highlight {
            id
          }
        }
        ... on DeleteHighlightError {
          errorCodes
        }
      }
    }
  `

  try {
    await gqlFetcher(mutation, { highlightId })
    return true
  } catch {
    return false
  }
}
