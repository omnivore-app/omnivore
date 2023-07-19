import { gql } from 'graphql-request'
import { gqlFetcher } from '../networkHelpers'
import { Subscription } from '../queries/useGetSubscriptionsQuery'

interface UpdateSubscriptionResult {
  updateSubscription: UpdateSubscription
}

interface UpdateSubscription {
  subscription: Subscription
  errorCodes?: unknown[]
}

interface UpdateSubscriptionInput {
  id: string
  lastFetchedAt?: Date
  name?: string
  description?: string
}

export async function updateSubscriptionMutation(
  input: UpdateSubscriptionInput
): Promise<any | undefined> {
  const mutation = gql`
    mutation UpdateSubscription($input: UpdateSubscriptionInput!) {
      updateSubscription(input: $input) {
        ... on UpdateSubscriptionSuccess {
          subscription {
            id
            lastFetchedAt
          }
        }
        ... on UpdateSubscriptionError {
          errorCodes
        }
      }
    }
  `

  try {
    const data = (await gqlFetcher(mutation, {
      input,
    })) as UpdateSubscriptionResult
    return data.updateSubscription.errorCodes
      ? undefined
      : data.updateSubscription.subscription.id
  } catch (error) {
    console.log('updateSubscriptionMutation error', error)
    return undefined
  }
}
