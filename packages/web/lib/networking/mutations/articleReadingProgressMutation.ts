import { gql } from 'graphql-request'
import { gqlFetcher } from '../networkHelpers'

export type ArticleReadingProgressMutationInput = {
  id: string
  readingProgressPercent: number
  readingProgressAnchorIndex: number
}

export async function articleReadingProgressMutation(
  input: ArticleReadingProgressMutationInput
): Promise<boolean> {
  const mutation = gql`
    mutation SaveArticleReadingProgress(
      $input: SaveArticleReadingProgressInput!
    ) {
      saveArticleReadingProgress(input: $input) {
        ... on SaveArticleReadingProgressSuccess {
          updatedArticle {
            id
            readingProgressPercent
            readingProgressAnchorIndex
          }
        }
        ... on SaveArticleReadingProgressError {
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
