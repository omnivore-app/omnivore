import { gql } from 'graphql-request'
import useSWR from 'swr'
import { publicGqlFetcher } from '../networkHelpers'

export type WebhookEvent =
  | 'PAGE_CREATED'
  | 'PAGE_UPDATED'
  | 'PAGE_DELETED'
  | 'HIGHLIGHT_CREATED'
  | 'HIGHLIGHT_UPDATED'
  | 'HIGHLIGHT_DELETED'
  | 'LABEL_CREATED'
  | 'LABEL_UPDATED'
  | 'LABEL_DELETED'

export interface Webhook {
  id: string
  url: string
  eventTypes: WebhookEvent[]
  contentType: string
  method: string
  enabled: boolean
  createdAt: Date
  updatedAt: Date
}

interface WebhooksQueryResponse {
  isValidating: boolean
  webhooks: Webhook[]
  revalidate: () => void
}

interface WebhooksQueryResponseData {
  webhooks: WebhooksData
}

interface WebhooksData {
  webhooks: unknown
}

export function useGetWebhooksQuery(): WebhooksQueryResponse {
  const query = gql`
    query GetWebhooks {
      webhooks {
        ... on WebhooksSuccess {
          webhooks {
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
        ... on WebhooksError {
          errorCodes
        }
      }
    }
  `

  const { data, mutate, isValidating } = useSWR(query, publicGqlFetcher)
  try {
    if (data) {
      const result = data as WebhooksQueryResponseData
      const webhooks = result.webhooks.webhooks as Webhook[]
      return {
        isValidating,
        webhooks,
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
    webhooks: [],
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    revalidate: () => {},
  }
}
