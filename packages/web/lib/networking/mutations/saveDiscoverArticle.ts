import { gql } from 'graphql-request'
import { gqlFetcher } from '../networkHelpers'
import { SavedSearch } from "../fragments/savedSearchFragment"

export type AddDiscoverArticleInput = {
  discoveryArticleId: string,
  locale: string,
  timezone: string,
}

export type SaveDiscoveryArticleOutput = {
  saveDiscoveryArticle: { url: string, saveId: string }
}

export async function saveDiscoverArticleMutation (
  input: AddDiscoverArticleInput
): Promise<SaveDiscoveryArticleOutput | undefined> {
  const mutation = gql`
    mutation SaveDiscovery($input: SaveDiscoveryArticleInput!) {
      saveDiscoveryArticle(input: $input) {
        ... on SaveDiscoveryArticleSuccess {
          url,
          saveId
        }

        ... on SaveDiscoveryArticleError {
          errorCodes
        }
      }
    }
  `

  const data = await gqlFetcher(mutation, { input }) as SaveDiscoveryArticleOutput;
  return data;
}
