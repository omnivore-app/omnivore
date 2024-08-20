import { useQuery } from '@tanstack/react-query'
import { gqlFetcher } from '../networkHelpers'
import { gql } from 'graphql-request'
import {
  Subscription,
  SubscriptionType,
} from '../queries/useGetSubscriptionsQuery'

export function useGetSubscriptions(
  variables: {
    type?: SubscriptionType | undefined
    sortBy?: string | undefined
  },
  enabled = true
) {
  return useQuery({
    queryKey: ['subscriptions'],
    queryFn: async () => {
      const response = (await gqlFetcher(GQL_GET_SUBSCRIPTIONS, {
        type: variables.type,
        sort: {
          by: variables.sortBy ?? 'UPDATED_TIME',
        },
      })) as SubscriptionsData
      if (response.subscriptions?.errorCodes?.length) {
        throw new Error(response.subscriptions.errorCodes[0])
      }
      return response.subscriptions.subscriptions
    },
    enabled,
  })
}

type SubscriptionsResult = {
  errorCodes?: string[]
  subscriptions: Subscription[]
}

type SubscriptionsData = {
  subscriptions: SubscriptionsResult
}

const GQL_GET_SUBSCRIPTIONS = gql`
  query GetSubscriptions($type: SubscriptionType, $sort: SortParams) {
    subscriptions(type: $type, sort: $sort) {
      ... on SubscriptionsSuccess {
        subscriptions {
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
      ... on SubscriptionsError {
        errorCodes
      }
    }
  }
`
