import {  VStack } from "../../../elements/LayoutPrimitives"
import { Toaster } from "react-hot-toast"
import { LayoutType } from "../../homeFeed/HomeFeedContainer"
import { UserBasicData } from "../../../../lib/networking/queries/useGetViewerQuery"
import { DiscoveryItems } from "../DiscoveryItems/DiscoveryItems"
import { DiscoveryItem } from "../../../../lib/networking/queries/useGetDiscoveryItems"

type DiscoveryItemFeedProps = {
  items: DiscoveryItem[]
  layout: LayoutType
  viewer: UserBasicData | undefined

  handleLinkSubmission: (
    link: string,
    timezone: string,
    locale: string
  ) => Promise<void>
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
