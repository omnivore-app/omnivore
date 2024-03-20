import { gql } from 'graphql-request'
import useSWR from 'swr'
import { makeGqlFetcher } from '../networkHelpers'
import { Integration } from './useGetIntegrationsQuery'

interface IntegrationQueryResponse {
  isValidating: boolean
  integration: Integration | null
  revalidate: () => void
}

interface IntegrationQueryResponseData {
  integration: IntegrationData
}

interface IntegrationData {
  integration: unknown
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

  const { data, mutate, isValidating } = useSWR(query, makeGqlFetcher({ name }))
  try {
    if (data) {
      const result = data as IntegrationQueryResponseData
      const integration = result.integration.integration as Integration
      return {
        isValidating,
        integration,
        revalidate: () => {
          mutate()
        },
      }
    }
  } catch (error) {
    console.log('error', error)
  }

  return {
    isValidating: false,
    integration: null,
    revalidate: () => {
      mutate()
    },
  }
}
