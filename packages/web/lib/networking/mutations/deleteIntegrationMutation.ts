import { gql } from 'graphql-request'
import { gqlFetcher } from '../networkHelpers'
import { IntegrationType } from '../queries/useGetIntegrationsQuery'

type DeleteIntegrationResult = {
  deleteIntegration?: DeleteIntegrationData
}

type DeleteIntegrationData = {
  deleteIntegration?: DeleteIntegrationSuccess
  errorCodes?: unknown[]
}

type DeleteIntegrationSuccess = {
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

export async function deleteIntegrationMutation(
  id: string
): Promise<Integration> {
  const mutation = gql`
    mutation DeleteIntegration($id: ID!) {
      deleteIntegration(id: $id) {
        ... on DeleteIntegrationSuccess {
          integration {
            id
          }
        }
        ... on DeleteIntegrationError {
          errorCodes
        }
      }
    }
  `

  const data = (await gqlFetcher(mutation, { id })) as DeleteIntegrationResult
  const output = data as any
  const error = data.deleteIntegration?.errorCodes?.find(() => true)
  if (error) {
    throw error
  }
  return output.deleteIntegration?.deleteIntegration?.integration
}
