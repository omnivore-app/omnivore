import React from 'react'
import { Box, VStack } from '../../../elements/LayoutPrimitives'
import { LIBRARY_LEFT_MENU_WIDTH } from '../../navMenu/LibraryMenu'
import { LargeHeaderLayout } from './LargerHeaderLayout'
import { SmallHeaderLayout } from './SmallerHeaderLayout'
import { LayoutType, TopicTabData } from '../DiscoverContainer'
import { DiscoverFeed } from "../../../../lib/networking/queries/useGetDiscoverFeeds"

export type DiscoverHeaderProps = {
  alwaysShowHeader: boolean
  allowSelectMultiple: boolean

  showFilterMenu: boolean
  setShowFilterMenu: (show: boolean) => void

  setShowAddLinkModal: (show: boolean) => void

  handleLinkSubmission: (
    link: string,
    timezone: string,
    locale: string
  ) => Promise<void>

  activeTab: TopicTabData
  setActiveTab: (tab: TopicTabData) => void

  topics: TopicTabData[]

  feeds: DiscoverFeed[]
  applyFeedFilter: (feedFilter: string) => void
  selectedFeedFilter: string

  layout: LayoutType
  setLayoutType: (layout: LayoutType) => void
}

function DiscoverHeaderSpace() {
  return (
    <Box
      css={{
        height: '90px',
        bg: '$grayBase',
        '@media (max-width: 930px)': {
          height: '70px',
        },
      }}
    ></Box>
  )
}

export function DiscoverHeader(props: DiscoverHeaderProps): JSX.Element {
  return (
    <>
      <VStack
        alignment="center"
        distribution="start"
        css={{
          pt: '15px',
          top: '0',
          right: '0',
          left: LIBRARY_LEFT_MENU_WIDTH,
          zIndex: 5,
          position: 'fixed',
          bg: '$thLibraryBackground',
          '@mdDown': {
            left: '0px',
            pt: '0px',
          },
        }}
      >
        {/* These will display/hide depending on breakpoints */}
        <LargeHeaderLayout {...props} />
        <SmallHeaderLayout {...props} />
      </VStack>

      {/* This spacer is put in to push library content down
      below the fixed header height. */}
      <DiscoverHeaderSpace />
    </>
  )
}
