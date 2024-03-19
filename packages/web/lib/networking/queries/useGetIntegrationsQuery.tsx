import { gql } from 'graphql-request'
import useSWR from 'swr'
import { publicGqlFetcher } from '../networkHelpers'

export interface Integration {
  id: string
  name: string
  type: IntegrationType
  token: string
  enabled: boolean
  createdAt: Date
  updatedAt: Date
  taskName?: string
  settings?: any
}

export type IntegrationType = 'EXPORT' | 'IMPORT'

interface IntegrationsQueryResponse {
  isValidating: boolean
  integrations: Integration[]
  revalidate: () => void
}

interface IntegrationsQueryResponseData {
  integrations: IntegrationsData
}

interface IntegrationsData {
  integrations: unknown
}

export function useGetIntegrationsQuery(): IntegrationsQueryResponse {
  const query = gql`
    query GetIntegrations {
      integrations {
        ... on IntegrationsSuccess {
          integrations {
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
        ... on IntegrationsError {
          errorCodes
        }
      }
    }
  `

  const { data, mutate, isValidating } = useSWR(query, publicGqlFetcher)
  try {
    if (data) {
      const result = data as IntegrationsQueryResponseData
      const integrations = result.integrations.integrations as Integration[]
      return {
        isValidating,
        integrations,
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
    integrations: [],
    revalidate: () => {
      mutate()
    },
  }
}
