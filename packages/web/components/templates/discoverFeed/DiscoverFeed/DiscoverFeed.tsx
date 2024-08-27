import { HStack, VStack } from '../../../elements/LayoutPrimitives'
import { LayoutType } from '../../homeFeed/HomeFeedContainer'
import { UserBasicData } from '../../../../lib/networking/queries/useGetViewerQuery'
import { DiscoverItems } from '../DiscoverItems/DiscoverItems'
import { SaveDiscoverArticleOutput } from '../../../../lib/networking/mutations/saveDiscoverArticle'
import { HeaderText } from '../DiscoverHeader/HeaderText'
import React from 'react'
import { TopicTabData } from '../DiscoverContainer'
import { DiscoverFeedItem } from '../../../../lib/networking/queries/useGetDiscoverFeedItems'

type DiscoverItemFeedProps = {
  items: DiscoverFeedItem[]
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
