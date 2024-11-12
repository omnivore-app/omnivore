import { gql } from 'graphql-request'
import { gqlFetcher } from '../networkHelpers'
import { Webhook } from '../queries/useGetWebhooksQuery'

interface DeleteWebhookResult {
  deleteWebhook: DeleteWebhook
  errorCodes?: unknown[]
}

type DeleteWebhook = {
  webhook: Webhook
}

export async function deleteWebhookMutation(
  id: string
): Promise<any | undefined> {
  const mutation = gql`
    mutation DeleteWebhook($id: ID!) {
      deleteWebhook(id: $id) {
        ... on DeleteWebhookSuccess {
          webhook {
            id
          }
        }
        ... on DeleteWebhookError {
          errorCodes
        }
      }
    }
  `

  try {
    const data = (await gqlFetcher(mutation, { id })) as DeleteWebhookResult
    return data.errorCodes ? undefined : data.deleteWebhook.webhook.id
  } catch (error) {
    console.log('deleteWebhookMutation error', error)
    return undefined
  }
}
