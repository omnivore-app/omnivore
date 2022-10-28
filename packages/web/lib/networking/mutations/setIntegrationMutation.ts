import { gql } from 'graphql-request'
import { gqlFetcher } from '../networkHelpers'
import { IntegrationType } from '../queries/useGetIntegrationsQuery'

export type SetIntegrationInput = {
  id?: string
  type: IntegrationType
  token: string,
  enabled: boolean
}

type SetIntegrationResult = {
  setIntegration?: SetIntegrationData
}

type SetIntegrationData = {
  integration: Integration
  errorCodes?: unknown[]
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
): Promise<Integration | undefined> {
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

  const data = await gqlFetcher(mutation, { input }) as SetIntegrationResult
  const output = data as any
  const error = data.setIntegration?.errorCodes?.find(() => true)
  if (error) {
    if (error === 'INVALID_TOKEN')
      throw 'Your token is invalid.'
    throw error
  }
  return output.setIntegration?.integration
}
