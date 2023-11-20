import { gql } from 'graphql-request'
import { gqlFetcher } from '../networkHelpers'

export type DeleteDiscoverArticleInput = {
  discoveryArticleId: string
}

export type DeleteDiscoveryArticleOutput = {
  deleteDiscoveryArticle: { id: string }
}

export async function deleteDiscoverArticleMutation(
  input: DeleteDiscoverArticleInput
): Promise<DeleteDiscoveryArticleOutput | undefined> {
  const mutation = gql`
    mutation DeleteDiscoveryArticle($input: DeleteDiscoveryArticleInput!) {
      deleteDiscoveryArticle(input: $input) {
        ... on DeleteDiscoveryArticleSuccess {
          id
        }

        ... on DeleteDiscoveryArticleError {
          errorCodes
        }
      }
    }
  `

  const data = (await gqlFetcher(mutation, {
    input,
  })) as DeleteDiscoveryArticleOutput

  return data
}
