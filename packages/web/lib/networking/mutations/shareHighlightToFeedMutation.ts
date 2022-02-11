import { gql } from 'graphql-request'
import { gqlFetcher } from '../networkHelpers'

type ShareHighlightToFeedMutationInput = {
  id: string
  share: boolean
}

export async function shareHighlightToFeedMutation(
  input: ShareHighlightToFeedMutationInput
): Promise<boolean> {
  const mutation = gql`
    mutation SetShareHighlight($input: SetShareHighlightInput!) {
      setShareHighlight(input: $input) {
        ... on SetShareHighlightSuccess {
          highlight {
            id
          }
        }
        ... on SetShareHighlightError {
          errorCodes
        }
      }
    }
  `

  try {
    await gqlFetcher(mutation, { input })
    return true
  } catch {
    return false
  }
}
