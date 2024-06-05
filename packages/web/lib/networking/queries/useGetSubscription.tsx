import { gql } from 'graphql-request'
import useSWR from 'swr'
import { makeGqlFetcher } from '../networkHelpers'
import { Subscription } from './useGetSubscriptionsQuery'

type SubscriptionQueryResponse = {
  error: any
  mutate?: () => void
  isLoading: boolean
  isValidating: boolean
  subscription?: Subscription
}

type SubscriptionResponseData = {
  subscription: SubscriptionData
}

type SubscriptionData = {
  subscription: unknown
}

export function useGetSubscriptionQuery(
  subscriptionId: string | undefined
): SubscriptionQueryResponse {
  const query = gql`
    query GetSubscription($id: ID!) {
      subscription(id: $id) {
        ... on SubscriptionSuccess {
          subscription {
            id
            name
            type
            newsletterEmail
            url
            icon
            description
            status
            unsubscribeMailTo
            unsubscribeHttpUrl
            createdAt
            updatedAt
            lastFetchedAt
            fetchContentType
            mostRecentItemDate
            failedAt
          }
        }
        ... on SubscriptionError {
          errorCodes
        }
      }
    }
  `

  const variables = {
    id: subscriptionId,
  }

  const { data, error, mutate, isValidating } = useSWR(
    subscriptionId ? [query, variables] : null,
    makeGqlFetcher(variables)
  )

  try {
    if (data) {
      const result = data as SubscriptionResponseData
      const subscription = result.subscription.subscription as Subscription
      return {
        error,
        mutate,
        isLoading: !error && !data,
        isValidating,
        subscription,
      }
    }
  } catch (error) {
    console.log('error', error)
  }
  return {
    error,
    mutate,
    isLoading: !error && !data,
    isValidating: true,
  }
}
