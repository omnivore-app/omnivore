import { gql } from 'graphql-request'
import { gqlFetcher } from '../networkHelpers'
import {
  Highlight,
  highlightFragment,
  HighlightType,
} from './../fragments/highlightFragment'
import { CreateHighlightInput } from '../highlights/useItemHighlights'

type CreateHighlightOutput = {
  createHighlight: InnerCreateHighlightOutput
}

type InnerCreateHighlightOutput = {
  highlight: Highlight
}

export async function createHighlightMutation(
  input: CreateHighlightInput
): Promise<Highlight | undefined> {
  const mutation = gql`
    mutation CreateHighlight($input: CreateHighlightInput!) {
      createHighlight(input: $input) {
        ... on CreateHighlightSuccess {
          highlight {
            ...HighlightFields
          }
        }

        ... on CreateHighlightError {
          errorCodes
        }
      }
    }
    ${highlightFragment}
  `

  try {
    const data = await gqlFetcher(mutation, { input })
    const output = data as CreateHighlightOutput | undefined
    return output?.createHighlight.highlight
  } catch {
    return undefined
  }
}
