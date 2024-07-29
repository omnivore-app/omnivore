import { gql } from 'graphql-request'
import { highlightFragment } from '../fragments/highlightFragment'

export const GQL_CREATE_HIGHLIGHT = gql`
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

export const GQL_DELETE_HIGHLIGHT = gql`
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

export const GQL_UPDATE_HIGHLIGHT = gql`
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

export const GQL_MERGE_HIGHLIGHT = gql`
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
