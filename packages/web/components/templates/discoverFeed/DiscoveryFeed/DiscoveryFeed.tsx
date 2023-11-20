import { VStack } from '../../../elements/LayoutPrimitives'
import { Toaster } from 'react-hot-toast'
import { LayoutType } from '../../homeFeed/HomeFeedContainer'
import { UserBasicData } from '../../../../lib/networking/queries/useGetViewerQuery'
import { DiscoveryItems } from '../DiscoveryItems/DiscoveryItems'
import { DiscoveryItem } from '../../../../lib/networking/queries/useGetDiscoveryItems'
import { SaveDiscoveryArticleOutput } from "../../../../lib/networking/mutations/saveDiscoverArticle"

type DiscoveryItemFeedProps = {
  items: DiscoveryItem[]
  layout: LayoutType
  viewer?: UserBasicData

  handleLinkSubmission: (
    link: string,
    timezone: string,
    locale: string
  ) => Promise<SaveDiscoveryArticleOutput | undefined>
}
export const DiscoveryItemFeed = (props: DiscoveryItemFeedProps) => {
  return (
    <>
      <VStack
        alignment="start"
        distribution="start"
        css={{
          height: '100%',
          minHeight: '100vh',
        }}
      >
        <Toaster />
        <DiscoveryItems {...props} />
      </VStack>
    </>
  )
}
