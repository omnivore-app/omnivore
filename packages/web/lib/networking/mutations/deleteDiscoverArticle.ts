import { gql } from 'graphql-request'
import { gqlFetcher } from '../networkHelpers'

export type DeleteDiscoverArticleInput = {
  discoverArticleId: string
}

export type DeleteDiscoverArticleOutput = {
  deleteDiscoverArticle: { id: string }
}

export async function deleteDiscoverArticleMutation(
  input: DeleteDiscoverArticleInput,
): Promise<DeleteDiscoverArticleOutput | undefined> {
  const mutation = gql`
    mutation DeleteDiscoverArticle($input: DeleteDiscoverArticleInput!) {
      deleteDiscoverArticle(input: $input) {
        ... on DeleteDiscoverArticleSuccess {
          id
        }

        ... on DeleteDiscoverArticleError {
          errorCodes
        }
      }
    }
  `

  const data = (await gqlFetcher(mutation, {
    input,
  })) as DeleteDiscoverArticleOutput

  return data
}
