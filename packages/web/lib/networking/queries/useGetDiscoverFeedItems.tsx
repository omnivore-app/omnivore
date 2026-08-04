import { gql } from 'graphql-request'
import { gqlFetcher, publicGqlFetcher } from '../networkHelpers'
import { useEffect, useState } from 'react'
import { TopicTabData } from '../../../components/templates/discoverFeed/DiscoverContainer'
import { HideDiscoverArticleInput, HideDiscoverArticleOutput } from './useGetDiscoverFeeds'

const OMNIVORE_COMMUNITY_ID = '8217d320-aa5a-11ee-bbfe-a7cde356f524'

export type DiscoverFeedItem = {
  id: string
  feed: string
  title: string
  url: string
  author?: string
  image?: string
  publishedDate?: Date
  slug: string
  description: string
  siteName?: string
  saves?: number
  savedId?: string // Has the user saved this? If so then we can get it from here. This will allow us to link back
  savedLinkUrl?: string,
  hidden?: boolean
}

type DiscoverItemResponse = {
  error?: any
  discoverItems?: DiscoverFeedItem[]
  discoverItemErrors?: unknown
  isLoading: boolean
  setTopic: (topic: TopicTabData) => void
  activeTopic: TopicTabData
  hasMore: boolean
  page: number
  setPage: (page: number) => void,
  hideDiscoverArticleMutation :(
    input: HideDiscoverArticleInput
  ) => Promise<HideDiscoverArticleOutput | undefined>
}

export function useGetDiscoverFeedItems(
  startingTopic: TopicTabData,
  selectedFeed = 'All Feeds',
  limit = 10,
  showHidden = true
): DiscoverItemResponse {
  const [activeTopic, setTopic] = useState(startingTopic)
  const [discoverItems, setDiscoverItems] = useState<DiscoverFeedItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasMore, setHasMore] = useState(false)
  const [page, setPage] = useState(0)

  const fixedSelectedFeed =
    selectedFeed == 'Community' ? OMNIVORE_COMMUNITY_ID : selectedFeed
  const callDiscoverItems = () => {
    const query = gql`
    query GetDiscoverFeedItems {
      getDiscoverFeedArticles(discoverTopicId: "${
        activeTopic.title
      }", showHidden: ${showHidden}, first: ${limit}, after: "${page * limit}" ${
      fixedSelectedFeed == 'All Feeds' ? '' : `feedId: "${fixedSelectedFeed}"`
    }) {
        ... on GetDiscoverFeedArticleSuccess {
          discoverArticles {
            id, 
            feed,
            title,
            url,
            image,
            description,
            publishedDate,
            siteName, 
            slug,
            author,
            savedId, 
            savedLinkUrl,
            hidden
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
            totalCount
          }
        }
        ... on GetDiscoverFeedArticleError {
          errorCodes
        }
      }
    }
  `
    return publicGqlFetcher(query)
  }

  useEffect(() => {
    setDiscoverItems([])
    if (page == 0) {
      setIsLoading(true)
      callDiscoverItems().then((it: any) => {
        setIsLoading(false)
        setDiscoverItems(it.getDiscoverFeedArticles.discoverArticles)
        setHasMore(it.getDiscoverFeedArticles.pageInfo.hasNextPage)
      })
    } else {
      setPage(0)
    }
  }, [activeTopic, selectedFeed, showHidden])

  useEffect(() => {
    setIsLoading(true)
    callDiscoverItems().then((it: any) => {
      setIsLoading(false)
      setDiscoverItems([
        ...(discoverItems || []),
        ...(it.getDiscoverFeedArticles.discoverArticles || []),
      ])
      setHasMore(it.getDiscoverFeedArticles.pageInfo.hasNextPage)
    })
  }, [page])

  const hideDiscoverArticleMutation = async(
    input: HideDiscoverArticleInput
  ): Promise<HideDiscoverArticleOutput | undefined> => {
    const mutation = gql`
    mutation HideDiscoverArticle($input: HideDiscoverArticleInput!) {
      hideDiscoverArticle(input: $input) {
        ... on HideDiscoverArticleSuccess {
          id
        }

        ... on HideDiscoverArticleError {
          errorCodes
        }
      }
    }
  `

    const data = (await gqlFetcher(mutation, {
      input,
    })) as HideDiscoverArticleOutput

    const hiddenDiscoveryList = discoverItems.
      map(it => {
        if (it.id == data.hideDiscoverArticle.id) {
          return { ...it, hidden: input.setHidden }
        }

        return it
    })

    setDiscoverItems(hiddenDiscoveryList)

    return data
  }

  return {
    setTopic,
    activeTopic,
    discoverItems,
    isLoading,
    hasMore,
    page,
    setPage,
    hideDiscoverArticleMutation
  }
}
