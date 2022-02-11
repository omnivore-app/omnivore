import { gql } from 'graphql-request'
import { gqlFetcher } from '../networkHelpers'
import { Highlight } from './../fragments/highlightFragment'

type MergeHighlightInput = {
  id: string
  shortId: string
  articleId: string
  patch: string
  quote: string
  prefix?: string
  suffix?: string
  annotation?: string
  overlapHighlightIdList: string[]
}

type MergeHighlightOutput = {
  mergeHighlight: InnerMergeHighlightOutput
}

type InnerMergeHighlightOutput = {
  highlight: Highlight
  overlapHighlightIdList: string[]
}

export async function mergeHighlightMutation(
  input: MergeHighlightInput
): Promise<MergeHighlightOutput | undefined> {
  const mutation = gql`
    mutation MergeHighlight($input: MergeHighlightInput!) {
      mergeHighlight(input: $input) {
        ... on MergeHighlightSuccess {
          highlight {
            id
            shortId
            quote
            prefix
            suffix
            patch
            createdAt
            updatedAt
            annotation
            sharedAt
            user {
              id
              name
              profile {
                id
                pictureUrl
                username
              }
            }
            createdByMe
          }
          overlapHighlightIdList
        }
        ... on MergeHighlightError {
          errorCodes
        }
      }
    }
  `

  try {
    const data = await gqlFetcher(mutation, { input })
    return data as MergeHighlightOutput | undefined
  } catch {
    return undefined
  }
}
