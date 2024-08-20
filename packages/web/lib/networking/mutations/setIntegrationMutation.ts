import { gql } from 'graphql-request'
import { gqlFetcher } from '../networkHelpers'
import { IntegrationType } from '../queries/useGetIntegrationsQuery'

export enum ImportItemState {
  All = 'ALL',
  Archived = 'ARCHIVED',
  Unarchived = 'UNARCHIVED',
  Unread = 'UNREAD'
}

export type SetIntegrationInput = {
  id?: string
  name: string
  type: IntegrationType
  token: string
  enabled: boolean
  importItemState?: ImportItemState
  settings?: any
}

type SetIntegrationResult = {
  setIntegration: SetIntegrationData
}

export enum SetIntegrationErrorCode {
  AlreadyExists = 'ALREADY_EXISTS',
  BadRequest = 'BAD_REQUEST',
  InvalidToken = 'INVALID_TOKEN',
  NotFound = 'NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED',
}

type SetIntegrationData = {
  integration: Integration
  errorCodes?: SetIntegrationErrorCode[]
}

type Integration = {
  id: string
  name: string
  type: IntegrationType
  token: string
  enabled: boolean
  createdAt: Date
  updatedAt: Date
}

export async function setIntegrationMutation(
  input: SetIntegrationInput
): Promise<Integration> {
  const mutation = gql`
    mutation SetIntegration($input: SetIntegrationInput!) {
      setIntegration(input: $input) {
        ... on SetIntegrationSuccess {
          integration {
            id
            name
            type
            token
            enabled
            createdAt
            updatedAt
            settings
          }
        }
        ... on SetIntegrationError {
          errorCodes
        }
      }
    }
  `

  const data = (await gqlFetcher(mutation, { input })) as SetIntegrationResult
  const error = data.setIntegration.errorCodes?.find(() => true)
  if (error) {
    throw new Error(error)
  }

  return data.setIntegration.integration
}
