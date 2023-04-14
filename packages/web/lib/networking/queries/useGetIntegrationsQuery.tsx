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
          }
        }
        ... on IntegrationsError {
          errorCodes
        }
      }
    }
  `

  const { data, mutate, isValidating } = useSWR(query, publicGqlFetcher)
  console.log('integrations data', data)

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
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    revalidate: () => {},
  }
}
