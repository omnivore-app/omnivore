import { gql } from 'graphql-request'
import useSWR from 'swr'
import { makeGqlFetcher } from '../networkHelpers'
import { Subscription } from './useGetSubscriptionsQuery'

type SubscriptionQueryResponse = {
  error: any
  isLoading: boolean
  isValidating: boolean
  subscription?: Subscription
  revalidate: () => void
}

type SubscriptionResponseData = {
  subscription: SubscriptionData
}

type SubscriptionData = {
  subscription: unknown
}

export function useGetSubscriptionQuery(id: string): SubscriptionQueryResponse {
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
    id,
  }
  const { data, error, mutate, isValidating } = useSWR(
    [query, variables],
    makeGqlFetcher(variables)
  )

  try {
    if (data) {
      const result = data as SubscriptionResponseData
      const subscription = result.subscription.subscription as Subscription
      return {
        error,
        isLoading: !error && !data,
        isValidating,
        subscription,
        revalidate: () => {
          mutate()
        },
      }
    }
  } catch (error) {
    console.log('error', error)
  }
  return {
    error,
    isLoading: !error && !data,
    isValidating: true,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    revalidate: () => {},
  }
}
