import { HStack, VStack } from "../../../elements/LayoutPrimitives"
import { Toaster } from 'react-hot-toast'
import { LayoutType } from '../../homeFeed/HomeFeedContainer'
import { UserBasicData } from '../../../../lib/networking/queries/useGetViewerQuery'
import { DiscoverItems } from '../DiscoverItems/DiscoverItems'
import { DiscoverItem } from '../../../../lib/networking/queries/useGetDiscoverItems'
import { SaveDiscoverArticleOutput } from "../../../../lib/networking/mutations/saveDiscoverArticle"
import { HeaderText } from "../DiscoverHeader/HeaderText"
import React from "react"
import { TopicTabData } from "../DiscoverContainer"

type DiscoverItemFeedProps = {
  items: DiscoverItem[]
  layout: LayoutType
  viewer?: UserBasicData

  activeTab: TopicTabData

  handleLinkSubmission: (
    link: string,
    timezone: string,
    locale: string
  ) => Promise<SaveDiscoverArticleOutput | undefined>
}
export const DiscoverItemFeed = (props: DiscoverItemFeedProps) => {
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
        <HStack
          alignment="center"
          distribution={'start'}
          css={{
            gap: '10px',
            width: '95%',
            display: 'block',
            '@mdDown': {
              width: '95%',
              display: 'none',
            },
            '@media (max-width: 930px)': {
              display: 'none',
            },
            '@media (min-width: 930px)': {
              width: '660px',
            },
            '@media (min-width: 1280px)': {
              width: '1000px',
            },
            '@media (min-width: 1600px)': {
              width: '1340px',
            },
          }}
        >
          <HeaderText
            title={props.activeTab.title}
            subTitle={props.activeTab.subTitle}
          />
        </HStack>
        <DiscoverItems {...props} />
      </VStack>
    </>
  )
}
