import { gql } from 'graphql-request'
import useSWR from 'swr'
import { makeGqlFetcher } from '../networkHelpers'

type DiscoverFeedsQueryResponse = {
  error: any
  isLoading: boolean
  isValidating: boolean
  feeds: DiscoverFeed[]
  revalidate: () => void
}

export type DiscoverFeed = {
  id: string
  visibleName: string
  title: string
  link: string
  description?: string
  image?: string
  type: 'rss' | 'atom'
}

export function useGetDiscoverFeeds(): DiscoverFeedsQueryResponse {
  const query = gql`
    query GetDiscoverFeeds {
      discoverFeeds {
        ... on DiscoverFeedSuccess {
          feeds {
            visibleName
            id
            title
            link
            description
            image
            type
          }
        }
        ... on DiscoverFeedError {
          errorCodes
        }
      }
    }
  `

  const { data, error, mutate, isValidating } = useSWR(
    [query],
    makeGqlFetcher(query),
    {}
  )

  try {
    if (data) {
      const result = data as { discoverFeeds: { feeds: DiscoverFeed[] } }
      const feeds = result.discoverFeeds.feeds as DiscoverFeed[]
      return {
        error,
        isLoading: !error && !data,
        isValidating,
        feeds,
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
    feeds: [],
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    revalidate: () => {},
  }
}
