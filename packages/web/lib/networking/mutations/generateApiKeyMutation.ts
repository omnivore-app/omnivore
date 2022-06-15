import { gql } from 'graphql-request'
import { gqlFetcher } from '../networkHelpers'
import { ApiKey } from '../queries/useGetApiKeysQuery'

export interface GenerateApiKeyInput {
  name: string
  scopes?: string[]
  expiresAt: Date
}

interface GenerateApiKeyResult {
  generateApiKey: GenerateApiKey
  errorCodes?: unknown[]
}

type GenerateApiKey = {
  apiKey: ApiKey
}

export async function generateApiKeyMutation(
  input: GenerateApiKeyInput
): Promise<string | undefined> {
  const mutation = gql`
    mutation GenerateApiKey($input: GenerateApiKeyInput!) {
      generateApiKey(input: $input) {
        ... on GenerateApiKeySuccess {
          apiKey {
            key
          }
        }
        ... on GenerateApiKeyError {
          errorCodes
        }
      }
    }
  `

  try {
    const data = (await gqlFetcher(mutation, {
      input,
    })) as GenerateApiKeyResult
    return data.errorCodes ? undefined : data.generateApiKey.apiKey.key
  } catch (error) {
    console.log('generateApiKeyMutation error', error)
    return undefined
  }
}
