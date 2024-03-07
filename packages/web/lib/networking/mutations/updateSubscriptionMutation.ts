import { gql } from 'graphql-request'
import { gqlFetcher } from '../networkHelpers'
import {
  FetchContentType,
  Subscription,
  SubscriptionStatus,
} from '../queries/useGetSubscriptionsQuery'

interface UpdateSubscriptionResult {
  updateSubscription: UpdateSubscription
}

export enum UpdateSubscriptionErrorCode {
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED',
}

interface UpdateSubscription {
  subscription?: Subscription
  errorCodes?: UpdateSubscriptionErrorCode[]
}

export interface UpdateSubscriptionInput {
  id: string
  lastFetchedAt?: Date
  name?: string
  description?: string
  status?: SubscriptionStatus
  autoAddToLibrary?: boolean
  isPrivate?: boolean
  fetchContentType?: FetchContentType
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
        errorCodes: [UpdateSubscriptionErrorCode.BadRequest],
      },
    }
  }
}
