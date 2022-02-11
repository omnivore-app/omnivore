import { gql } from 'graphql-request'
import { gqlFetcher } from '../networkHelpers'

type ShareHighlightCommentMutationInput = {
  highlightId: string
  annotation?: string
}

export async function shareHighlightCommentMutation(
  input: ShareHighlightCommentMutationInput
): Promise<boolean> {
  const mutation = gql`
    mutation UpdateHighlight($input: UpdateHighlightInput!) {
      updateHighlight(input: $input) {
        ... on UpdateHighlightSuccess {
          highlight {
            id
          }
        }

        ... on UpdateHighlightError {
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
