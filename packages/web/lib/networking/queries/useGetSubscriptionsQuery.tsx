import { gql } from 'graphql-request'
import useSWR from 'swr'
import { gqlFetcher, makeGqlFetcher, publicGqlFetcher } from '../networkHelpers'

export type SubscriptionStatus = 'ACTIVE' | 'DELETED' | 'UNSUBSCRIBED'

export enum SubscriptionType {
  RSS = 'RSS',
  NEWSLETTER = 'NEWSLETTER',
}

export type Subscription = {
  id: string
  name: string
  type: SubscriptionType
  newsletterEmail?: string

  url?: string
  description?: string

  status: SubscriptionStatus
  createdAt: string
  updatedAt: string
  lastFetchedAt?: string
}

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

export function useGetSubscriptionsQuery(
  type: SubscriptionType | undefined,
  sortBy = 'UPDATED_TIME'
): SubscriptionsQueryResponse {
  const query = gql`
    query GetSubscriptions($type: SubscriptionType, $sort: SortParams) {
      subscriptions(type: $type, sort: $sort) {
        ... on SubscriptionsSuccess {
          subscriptions {
            id
            name
            type
            newsletterEmail
            url
            description
            status
            unsubscribeMailTo
            unsubscribeHttpUrl
            createdAt
            updatedAt
            lastFetchedAt
          }
        }
        ... on SubscriptionsError {
          errorCodes
        }
      }
    }
  `

  try {
    const { data, mutate, isValidating } = useSWR(
      query,
      makeGqlFetcher({
        type,
        sort: {
          by: sortBy,
        },
      })
    )

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
    isValidating: true,
    subscriptions: [],
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    revalidate: () => {},
  }
}
