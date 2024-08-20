import { gql } from 'graphql-request'
import useSWR from 'swr'
import { publicGqlFetcher } from '../networkHelpers'
import { HomeSection } from './useGetHome'

type HiddenHomeSectionResult = {
  hiddenHomeSection: {
    section?: HomeSection
    errorCodes?: string[]
  }
}

export type HiddenHomeSectionResponse = {
  error: boolean
  isValidating: boolean
  errorMessage?: string
  section?: HomeSection
  mutate?: () => void
}

export function useGetHiddenHomeSection(): HiddenHomeSectionResponse {
  const query = gql`
    query HiddenHomeSection {
      hiddenHomeSection {
        ... on HiddenHomeSectionSuccess {
          section {
            title
            layout
            thumbnail
            items {
              id
              title
              url
              slug
              score
              thumbnail
              previewContent
              saveCount
              likeCount
              broadcastCount
              date
              author
              dir
              seen_at
              wordCount
              source {
                id
                name
                url
                icon
                type
              }
              canSave
              canMove
              canComment
              canShare
              canArchive
              canDelete
            }
          }
        }
        ... on HiddenHomeSectionError {
          errorCodes
        }
      }
    }
  `

  const { data, error, isValidating, mutate } = useSWR(query, publicGqlFetcher)
  console.log('HiddenHomeSection data', data)

  if (error) {
    return {
      error: true,
      isValidating,
      errorMessage: error.toString(),
    }
  }

  const result = data as HiddenHomeSectionResult

  if (result && result.hiddenHomeSection.errorCodes) {
    const errorCodes = result.hiddenHomeSection.errorCodes
    return {
      error: true,
      isValidating,
      errorMessage: errorCodes.length > 0 ? errorCodes[0] : undefined,
    }
  }

  if (result && result.hiddenHomeSection && result.hiddenHomeSection.section) {
    return {
      mutate,
      error: false,
      isValidating,
      section: result.hiddenHomeSection.section,
    }
  }

  return {
    isValidating,
    error: !!error,
  }
}
