import { gql } from 'graphql-request'
import useSWR from 'swr'
import { publicGqlFetcher } from '../networkHelpers'
import { Subscription } from '@omnivore/api/src/generated/graphql'

type SubscriptionsQueryResponse = {
  isValidating: boolean
  subscriptions: Subscription[]
  revalidate: () => void
}

type SubscriptionsResponseData = {
  subscriptions: SubscriptionsData
}

type SubscriptionsData = {
  subscriptions: unknown
}

export function useGetSubscriptionsQuery(): SubscriptionsQueryResponse {
  const query = gql`
    query GetSubscriptions {
      subscriptions {
        ... on SubscriptionsSuccess {
          subscriptions {
            id
            name
            url
            description
            status
            unsubscribeMailTo
            unsubscribeHttpUrl
            createdAt
            updatedAt
          }
        }
        ... on SubscriptionsError {
          errorCodes
        }
      }
    }
  `

  const { data, mutate, error, isValidating } = useSWR(query, publicGqlFetcher)

  try {
    if (data) {
      const result = data as SubscriptionsResponseData
      const subscriptions = result.subscriptions.subscriptions as Subscription[]
      return {
        isValidating,
        subscriptions,
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
    subscriptions: [],
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    revalidate: () => {},
  }
}
