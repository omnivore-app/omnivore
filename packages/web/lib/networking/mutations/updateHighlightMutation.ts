import { gql } from 'graphql-request'
import { gqlFetcher } from '../networkHelpers'

export type UpdateHighlightInput = {
  highlightId: string
  libraryItemId?: string
  annotation?: string
  sharedAt?: string
  color?: string
}

type UpdateHighlightOutput = {
  updateHighlight: HighlightOutput
}

type HighlightOutput = {
  highlight: HighlightId
}

type HighlightId = {
  id: string
}

export async function updateHighlightMutation(
  input: UpdateHighlightInput
): Promise<string | undefined> {
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
    const data = await gqlFetcher(mutation, {
      input: {
        highlightId: input.highlightId,
        annotation: input.annotation,
        color: input.color,
      },
    })
    const output = data as UpdateHighlightOutput | undefined
    return output?.updateHighlight.highlight.id
  } catch {
    return undefined
  }
}
