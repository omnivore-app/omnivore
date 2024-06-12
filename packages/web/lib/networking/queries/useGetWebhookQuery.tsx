import { gql } from 'graphql-request'
import useSWR from 'swr'
import { makeGqlFetcher } from '../networkHelpers'
import { Webhook } from './useGetWebhooksQuery'

interface WebhookQueryResponse {
  isValidating?: boolean
  webhook?: Webhook
  revalidate?: () => void
}

interface WebhookQueryResponseData {
  webhook: WebhookData
}

interface WebhookData {
  webhook: unknown
}

export function useGetWebhookQuery(id: string): WebhookQueryResponse {
  const query = gql`
    query GetWebhook($id: ID!) {
      webhook(id: $id) {
        ... on WebhookSuccess {
          webhook {
            id
            url
            eventTypes
            contentType
            method
            enabled
            createdAt
            updatedAt
          }
        }
        ... on WebhookError {
          errorCodes
        }
      }
    }
  `

  const { data, mutate, isValidating } = useSWR(
    query,
    makeGqlFetcher(query, { id }),
    {}
  )

  try {
    if (data) {
      const result = data as WebhookQueryResponseData
      const webhook = result.webhook.webhook as Webhook
      return {
        isValidating,
        webhook,
        revalidate: () => {
          mutate()
        },
      }
    }
  } catch (error) {
    console.log('error', error)
  }
  return {}
}
