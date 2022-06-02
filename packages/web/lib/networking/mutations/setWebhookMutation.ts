import { gql } from 'graphql-request'
import { gqlFetcher } from '../networkHelpers'
import { Webhook, WebhookEvent } from '../queries/useGetWebhooksQuery'

export interface SetWebhookInput {
  contentType?: string[]
  enabled?: boolean
  eventTypes: WebhookEvent[]
  id?: string
  method?: string
  url: string
}

interface SetWebhookResult {
  setWebhook: SetWebhook
  errorCodes?: unknown[]
}

type SetWebhook = {
  webhook: Webhook
}

export async function setWebhookMutation(
  input: SetWebhookInput
): Promise<string | undefined> {
  const mutation = gql`
    mutation SetWebhook($input: SetWebhookInput!) {
      setWebhook(input: $input) {
        ... on SetWebhookSuccess {
          webhook {
            id
          }
        }
        ... on SetWebhookError {
          errorCodes
        }
      }
    }
  `

  try {
    const data = (await gqlFetcher(mutation, {
      input,
    })) as SetWebhookResult
    return data.errorCodes ? undefined : data.setWebhook.webhook.id
  } catch (error) {
    console.log('setWebhookMutation error', error)
    return undefined
  }
}
