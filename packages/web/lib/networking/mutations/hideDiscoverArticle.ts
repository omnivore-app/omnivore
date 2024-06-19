import { gql } from 'graphql-request'
import { gqlFetcher } from '../networkHelpers'

export type HideDiscoverArticleInput = {
  discoverArticleId: string
  setHidden: boolean
}

export type HideDiscoverArticleOutput = {
  hideDiscoverArticle: { id: string }
}

export async function hideDiscoverArticleMutation(
  input: HideDiscoverArticleInput
): Promise<HideDiscoverArticleOutput | undefined> {
  const mutation = gql`
    mutation HideDiscoverArticle($input: HideDiscoverArticleInput!) {
      hideDiscoverArticle(input: $input) {
        ... on HideDiscoverArticleSuccess {
          id
        }

        ... on HideDiscoverArticleError {
          errorCodes
        }
      }
    }
  `

  const data = (await gqlFetcher(mutation, {
    input,
  })) as HideDiscoverArticleOutput

  return data
}
