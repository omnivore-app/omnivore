import { gql } from 'graphql-request'
import useSWR from 'swr'
import { makeGqlFetcher } from '../networkHelpers'
import { Integration } from './useGetIntegrationsQuery'

interface IntegrationQueryResponse {
  isValidating: boolean
  integration: Integration
  revalidate: () => void
}

interface IntegrationQueryResponseData {
  integration: {
    integration: Integration
    errorCodes?: string[]
  }
}

export function useGetIntegrationQuery(name: string): IntegrationQueryResponse {
  const query = gql`
    query GetIntegration($name: String!) {
      integration(name: $name) {
        ... on IntegrationSuccess {
          integration {
            id
            name
            type
            token
            enabled
            createdAt
            updatedAt
            taskName
            settings
          }
        }
        ... on IntegrationError {
          errorCodes
        }
      }
    }
  `

  const { data, mutate, isValidating } = useSWR(
    query,
    makeGqlFetcher(query, { name }),
    {}
  )
  if (!data) {
    return {
      isValidating,
      integration: {} as Integration,
      revalidate: () => {
        mutate()
      },
    }
  }

  const result = data as IntegrationQueryResponseData
  const error = result.integration.errorCodes?.find(() => true)
  if (error) {
    throw error
  }

  return {
    isValidating,
    integration: result.integration.integration,
    revalidate: () => {
      mutate()
    },
  }
}
