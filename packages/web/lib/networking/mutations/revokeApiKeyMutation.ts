import { gql } from 'graphql-request'
import { gqlFetcher } from '../networkHelpers'
import { ApiKey } from '../queries/useGetApiKeysQuery'

interface RevokeApiKeyResult {
  revokeApiKey: RevokeApiKey
  errorCodes?: unknown[]
}

type RevokeApiKey = {
  apiKey: ApiKey
}

export async function revokeApiKeyMutation(
  id: string
): Promise<any | undefined> {
  const mutation = gql`
    mutation RevokeApiKey($id: ID!) {
      revokeApiKey(id: $id) {
        ... on RevokeApiKeySuccess {
          apiKey {
            id
          }
        }
        ... on RevokeApiKeyError {
          errorCodes
        }
      }
    }
  `

  try {
    const data = (await gqlFetcher(mutation, { id })) as RevokeApiKeyResult
    return data.errorCodes ? undefined : data.revokeApiKey.apiKey.id
  } catch (error) {
    console.log('revokeApiKeyMutation error', error)
    return undefined
  }
}
