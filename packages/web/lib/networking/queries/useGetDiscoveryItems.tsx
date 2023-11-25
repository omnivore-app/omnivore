import { gql } from "graphql-request"
import { publicGqlFetcher } from "../networkHelpers"
import { useEffect, useState } from "react"
import { TopicTabData } from "../../../components/templates/discoverFeed/DiscoverContainer"

export type DiscoveryItem = {
  id: string
  title: string
  url: string
  author?: string
  image?: string
  publishedDate?: Date
  slug: string
  description: string
  siteName?: string
  saves?: number;
  savedId?: string // Has the user saved this? If so then we can get it from here. This will allow us to link back
  savedLinkUrl?: string
}

type DiscoveryItemResponse = {
  error?: any
  discoveryItems?: DiscoveryItem[]
  discoveryItemErrors?: unknown
  isLoading: boolean
  setTopic: (topic: TopicTabData) => void
  activeTopic: TopicTabData
  hasMore: boolean
  page: number
  setPage: (page: number) => void
}

export function useGetDiscoveryItems(
  startingTopic: TopicTabData,
  limit = 10,
): DiscoveryItemResponse {
  const [activeTopic, setTopic] = useState(startingTopic)
  const [discoveryItems, setDiscoveryItems] = useState<DiscoveryItem[]>([])
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);

  const callDiscoverItems = () => {
    const query = gql`
    query GetDiscoveryItems {
      getDiscoveryArticles(discoveryTopicId: "${activeTopic.title}", first: ${limit}, after: "${page * limit}") {
        ... on GetDiscoveryArticleSuccess {
          discoverArticles {
            id, 
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
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
            totalCount
          }
        }
        ... on GetDiscoveryArticleError {
          errorCodes
        }
      }
    }
  `
    return publicGqlFetcher(query);
  }


  useEffect(() => {
    setDiscoveryItems([])
    if (page == 0) {
      setIsLoading(true);
      callDiscoverItems()
        .then((it: any) => {
          setIsLoading(false);
          setDiscoveryItems(it.getDiscoveryArticles.discoverArticles)
          setHasMore(it.getDiscoveryArticles.pageInfo.hasNextPage)
        })
    } else {
      setPage(0)
    }
  }, [activeTopic])


  useEffect(() => {
    setIsLoading(true);
    callDiscoverItems()
      .then((it: any) => {
        setIsLoading(false);
        setDiscoveryItems([...discoveryItems, ...it.getDiscoveryArticles.discoverArticles])
        setHasMore(it.getDiscoveryArticles.pageInfo.hasNextPage)
      })
  }, [page])

  return {
    setTopic,
    activeTopic,
    discoveryItems,
    isLoading,
    hasMore,
    page,
    setPage
  }
}
