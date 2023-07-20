import { gql } from 'graphql-request'
import { gqlFetcher } from '../networkHelpers'
import {
  Subscription,
  SubscriptionType,
} from '../queries/useGetSubscriptionsQuery'

type SubscribeResult = {
  subscribe: Subscribe
}

enum SubscribeErrorCode {
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED',
  AlreadySubscribed = 'ALREADY_SUBSCRIBED',
}

type Subscribe = {
  subscriptions?: Subscription[]
  errorCodes?: SubscribeErrorCode[]
}

export type SubscribeMutationInput = {
  name?: string
  url?: string
  subscriptionType?: SubscriptionType
}

export async function subscribeMutation(
  input: SubscribeMutationInput
): Promise<SubscribeResult> {
  const mutation = gql`
    mutation Subscribe($input: SubscribeInput!) {
      subscribe(input: $input) {
        ... on SubscribeSuccess {
          subscriptions {
            id
          }
        }
        ... on SubscribeError {
          errorCodes
        }
      }
    }
  `
  try {
    const data = (await gqlFetcher(mutation, { input })) as SubscribeResult
    return data
  } catch (error) {
    console.log('subscribeMutation error', error)
    return {
      subscribe: {
        errorCodes: [SubscribeErrorCode.BadRequest],
      },
    }
  }
}
