import React from 'react'
import { HStack } from '../../../elements/LayoutPrimitives'
import { OmnivoreSmallLogo } from '../../../elements/images/OmnivoreNameLogo'
import { theme } from '../../../tokens/stitches.config'
import { FunnelSimple } from '@phosphor-icons/react'
import { DiscoverHeaderProps } from './DiscoverHeader'
import { SmallTopicBar } from './SmallTopicBar'
import { PrimaryDropdown } from '../../PrimaryDropdown'
import { PinnedFeeds } from './PinnedFeeds'

export function SmallHeaderLayout(props: DiscoverHeaderProps): JSX.Element {
  return (
    <HStack
      alignment="center"
      distribution="start"
      css={{
        width: '100vw',
        height: '100%',
        pt: '20px',
        pb: '10px',
        pl: '50px',
        bg: '$thReaderBg',
        '@md': {
          display: 'none',
        },
      }}
    >
      <>
        <SmallTopicBar {...props} />
        <HStack
          alignment="center"
          distribution={'start'}
          css={{
            position: 'absolute',
            left: '10px',
            top: '60px',
            gap: '10px',
            width: '95vw',
            paddingBottom: '5px',
            overflow: 'scroll',
            '::-webkit-scrollbar': {
              display: 'none',
            },
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
          }}
        >
          <PinnedFeeds items={props.feeds} selected={props.selectedFeedFilter} applyFeedFilter={props.applyFeedFilter} />
        </HStack>
      </>
    </HStack>
  )
}
