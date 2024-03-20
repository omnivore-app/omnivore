import { gql } from 'graphql-request'
import { gqlFetcher } from '../networkHelpers'

export type AddDiscoverArticleInput = {
  discoverArticleId: string
  locale: string
  timezone: string
}

export type SaveDiscoverArticleOutput = {
  saveDiscoverArticle: { url: string; saveId: string }
}

export async function saveDiscoverArticleMutation(
  input: AddDiscoverArticleInput,
): Promise<SaveDiscoverArticleOutput | undefined> {
  const mutation = gql`
    mutation SaveDiscover($input: SaveDiscoverArticleInput!) {
      saveDiscoverArticle(input: $input) {
        ... on SaveDiscoverArticleSuccess {
          url
          saveId
        }

        ... on SaveDiscoverArticleError {
          errorCodes
        }
      }
    }
  `

  const data = (await gqlFetcher(mutation, {
    input,
  })) as SaveDiscoverArticleOutput
  return data
}
