import { gql } from 'graphql-request'
import { gqlFetcher } from '../networkHelpers'
import { Highlight } from './../fragments/highlightFragment'

export type MergeHighlightInput = {
  id: string
  shortId: string
  articleId: string
  patch: string
  quote: string
  prefix?: string
  suffix?: string
  html?: string
  annotation?: string
  overlapHighlightIdList: string[]
  highlightPositionPercent?: number
  highlightPositionAnchorIndex?: number
}

export type MergeHighlightOutput = {
  mergeHighlight: InnerMergeHighlightOutput
}

type InnerMergeHighlightOutput = {
  highlight: Highlight
  overlapHighlightIdList: string[]
}

export async function mergeHighlightMutation(
  input: MergeHighlightInput
): Promise<Highlight | undefined> {
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
            color
            createdAt
            updatedAt
            annotation
            sharedAt
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
    const data = await gqlFetcher(mutation, {
      input: {
        id: input.id,
        shortId: input.shortId,
        articleId: input.articleId,
        patch: input.patch,
        quote: input.quote,
        prefix: input.prefix,
        suffix: input.suffix,
        html: input.html,
        annotation: input.annotation,
        overlapHighlightIdList: input.overlapHighlightIdList,
        highlightPositionPercent: input.highlightPositionPercent,
        highlightPositionAnchorIndex: input.highlightPositionAnchorIndex,
      },
    })
    const output = data as MergeHighlightOutput | undefined
    return output?.mergeHighlight.highlight
  } catch {
    return undefined
  }
}
