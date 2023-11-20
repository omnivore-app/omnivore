import { gql } from 'graphql-request'
import { publicGqlFetcher } from '../networkHelpers'
import { useEffect, useState } from 'react'
import { TopicTabData } from '../../../components/templates/discoverFeed/DiscoverContainer'

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
}

export function useGetDiscoveryItems(
  startingTopic: TopicTabData
): DiscoveryItemResponse {
  const [activeTopic, setTopic] = useState(startingTopic)
  const [discoveryItems, setDiscoveryItems] = useState<DiscoveryItem[]>([])

  useEffect(() => {
    const query = gql`
    query GetDiscoveryItems {
      getDiscoveryArticles(discoveryTopicId: "${activeTopic.title}") {
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
        }
        ... on GetDiscoveryArticleError {
          errorCodes
        }
      }
    }
  `
    publicGqlFetcher(query)
      .then((it: any) => {
        setDiscoveryItems(it.getDiscoveryArticles.discoverArticles)
      })
  }, [activeTopic])

  return {
    setTopic,
    activeTopic,
    discoveryItems,
    isLoading: false,
  }
}
