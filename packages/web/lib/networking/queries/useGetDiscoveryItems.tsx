import { gql } from 'graphql-request'
import useSWR from 'swr'
import { publicGqlFetcher } from '../networkHelpers'
import {
  SavedSearch,
  savedSearchFragment,
} from '../fragments/savedSearchFragment'
import { useEffect, useState } from "react"
import { TopicTabData } from "../../../components/templates/discoverFeed/DiscoverContainer"

export type DiscoveryItem = {
  id: string
  title: string
  url: string
  author?: string
  image?: string
  publishedAt?: Date
  slug: string
  description: string
  siteName?: string
  savedLinkSlug?: string // Has the user saved this? If so then we can get it from here. This will allow us to link back
}

type DiscoveryItemResponse = {
  error?: any
  discoveryItems?: DiscoveryItem[]
  discoveryItemErrors?: unknown
  isLoading: boolean,
  setTopic: (topic: TopicTabData) => void,
  activeTopic: TopicTabData
}

export function useGetDiscoveryItems(startingTopic: TopicTabData): DiscoveryItemResponse {
  const [activeTopic, setTopic] = useState(startingTopic);

  useEffect(() => {
    console.log("Why, hello there.")
  }, [activeTopic])

  return {
    setTopic,
    activeTopic,
    discoveryItems: [
      {
        id: 'test',
        title: 'Streaming at Scale with Kubernetes and RabbitMQ | Medium',
        url: 'www.medium.com',
        author: 'Alexandre Olive',
        image: 'https://proxy-prod.omnivore-image-cache.app/1400x0,smf8JrOQyaDijUHmnQhs23b1hHL56riHZKZEXQEJp6Bc/https://miro.medium.com/v2/resize:fit:1400/0*_1VGkx9gMk4afCpd',
        publishedAt: new Date(),
        slug: 'https-out-reddit-com-t-3-173-tjfv-app-name-mweb-token-aqa-ailck--18b15bf9fcb',
        description: 'Discover a complex production architecture that streams video to clients\' websites using Kubernetes, RabbitMQ, and FFmpeg.',
        siteName: 'Medium',
        isSaved: true
      },
      {
        id: 'test2',
        title: 'Testing Apple’s M3 Pro: More efficient, but performance is a step sideways | Ars Technica',
        url: 'https://arstechnica.com/gadgets/2023/11/testing-apples-m3-pro-more-efficient-but-performance-is-a-step-sideways/',
        author: 'Andrew Cunningham',
        image: 'https://proxy-prod.omnivore-image-cache.app/0x0,sMnzj_W3yImjpqdY3W8brFZ2qHvZkOhJ3ULLERFXVHTM/https://cdn.arstechnica.net/wp-content/uploads/2023/11/IMG_1460-800x533.jpeg',
        publishedAt: new Date(),
        slug: 'https-arstechnica-com-gadgets-2023-11-testing-apples-m-3-pro-mor-18bb511159a',
        description: 'When Apple announced the first three chips in its M3 processor family, the M3 Pro immediately stood out. Not because it was a huge improvement, but instead because it was not',
        siteName: 'Arstechnica.com',
        isSaved: false
      },{
        id: 'test3',
        title: 'Anthropic \\ Decomposing Language Models Into Understandable Components',
        url: 'https://anthropic.com/gadgets/2023/11/testing-apples-m3-pro-more-efficient-but-performance-is-a-step-sideways/',
        author: 'Sara Ngyuen',
        image: 'https://proxy-prod.omnivore-image-cache.app/320x320,skjN_pCCuXDKmFhAnvbp7SHzdkhvIY63F-ZFjz2DZnOA/https://efficient-manatee.transforms.svdcdn.com/production/images/Untitled-Artwork-11.png?w=1200&h=630&q=82&auto=format&fit=crop&dm=1696477668&s=fe41beb80074843426e455ad571ac77f',
        publishedAt: new Date(),
        slug: 'https-arstechnica-com-gadgets-2023-11-testing-apples-m-3-pro-mor-18bb511159a',
        description: 'Anthropic is an AI safety and research company that\'s working to build reliable, interpretable, and steerable AI systems.',
        siteName: 'anthropic.com',
        isSaved: false
      },
      {
        id: 'test2',
        title: 'How Will A.I. Learn Next? | The New Yorker',
        url: 'https://newyorker.com/gadgets/2023/11/testing-apples-m3-pro-more-efficient-but-performance-is-a-step-sideways/',
        author: 'Andrew Cunningham',
        image: 'https://proxy-prod.omnivore-image-cache.app/320x320,sLlY-DUy9KGkZvA2v5Rt5iAUnthjioOnU9E_5a-6ozTc/https://media.newyorker.com/photos/6515af47f20692d9e77465c8/16:9/w_1200,h_675,c_limit/AIKnowlwdgw_Final_2_s.gif',
        publishedAt: new Date(),
        slug: 'https-arstechnica-com-gadgets-2023-11-testing-apples-m-3-pro-mor-18bb511159a',
        description: 'James Somers on how A.I. chatbots such as ChatGPT and Google’s Bard will continue to learn and the contradictions entailed in their mission.',
        siteName: 'newyorker.com',
        isSaved: true,
      },
      {
        id: 'test2',
        title: 'The Racism Behind Alien Mummy Hoaxes - The Atlantic',
        url: 'https://theatlantic.com/gadgets/2023/11/testing-apples-m3-pro-more-efficient-but-performance-is-a-step-sideways/',
        author: 'Christopher Heaney',
        image: 'https://proxy-prod.omnivore-image-cache.app/655x929,s_StUEbxMsh1irHv8Yj_dzbFF7Q8xzBjD_n7jlzSn8J0/https://cdn.theatlantic.com/thumbor/45V6yxgSMG6OrS_AAYzThHlMaVQ=/0x0:722x1024/655x929/media/img/posts/2017/07/5._Rivero_Tschudi_mummy/original.jpg',
        publishedAt: new Date(),
        slug: 'https-arstechnica-com-gadgets-2023-11-testing-apples-m-3-pro-mor-18bb511159a',
        description: 'Pre-Columbian bodies are once again being used as evidence for extraterrestrial life.',
        siteName: 'newyorker.com',
        isSaved: false
      },
      {
        id: 'test2',
        title: 'Wait, is Unity allowed to just change its fee structure like that? | Ars Technica',
        url: 'https://arstechnica.com/gadgets/2023/11/testing-apples-m3-pro-more-efficient-but-performance-is-a-step-sideways/',
        author: 'Kyle Orland',
        image: 'https://proxy-prod.omnivore-image-cache.app/0x0,s-kcqA9OpfRaRvvWQyt29SeyoA5PgoysTqhuuHXlCw2c/https://cdn.arstechnica.net/wp-content/uploads/2023/09/unity-is-altering-the-deal-800x450.jpg',
        publishedAt: new Date(),
        slug: 'https-arstechnica-com-gadgets-2023-11-testing-apples-m-3-pro-mor-18bb511159a',
        description: 'Pray that I don\'t alter it any further',
        siteName: 'newyorker.com',
        isSaved: false
      }
    ],
    isLoading: false
  }
}
