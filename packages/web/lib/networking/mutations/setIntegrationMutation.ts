import { gql } from 'graphql-request'
import { gqlFetcher } from '../networkHelpers'

type IntegrationType = 'readwise'

export type SetIntegrationInput = {
  id?: string
  type: IntegrationType
  token: string,
  enabled: boolean
}

type SetIntegrationResult = {
  setIntegration?: SetIntegrationSuccess
  errorCodes?: unknown[]
}

type SetIntegrationSuccess = {
  integration: Integration
}

type Integration = {
  id: string
  type: IntegrationType
  token: string
  enabled: boolean
  createdAt: Date
  updatedAt: Date
}

export async function setIntegrationMutation(
  input: SetIntegrationInput
): Promise<string | undefined> {
  const mutation = gql`
    mutation SetIntegration(
      $input: SetIntegrationInput!
    ) {
      setIntegration(input: $input) {
        ... on SetIntegrationSuccess {
          integration {
            id
            type
            token
            enabled
            createdAt
            updatedAt
          }
        }
        ... on SetIntegrationError {
          errorCodes
        }
      }
    }
  `

  try {
    const data = await gqlFetcher(mutation) as SetIntegrationResult
    console.log(input, data);
    const output = data as any
    console.log(output)
    return output?.updatedLabel
  } catch (err) {
    return undefined
  }
}
