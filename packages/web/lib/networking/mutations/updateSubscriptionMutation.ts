import { gql } from 'graphql-request'
import { gqlFetcher } from '../networkHelpers'
import { Subscription } from '../queries/useGetSubscriptionsQuery'

interface UpdateSubscriptionResult {
  updateSubscription: UpdateSubscription
}

export enum UpdateSubscriptionErrorCode {
  BAD_REQUEST = 'BAD_REQUEST',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
}

interface UpdateSubscription {
  subscription?: Subscription
  errorCodes?: UpdateSubscriptionErrorCode[]
}

interface UpdateSubscriptionInput {
  id: string
  lastFetchedAt?: Date
  name?: string
  description?: string
}

export async function updateSubscriptionMutation(
  input: UpdateSubscriptionInput
): Promise<UpdateSubscriptionResult> {
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
    return data
  } catch (error) {
    console.log('updateSubscriptionMutation error', error)
    return {
      updateSubscription: {
        errorCodes: [UpdateSubscriptionErrorCode.BAD_REQUEST],
      },
    }
  }
}
