import React from 'react'
import { HStack } from '../../../elements/LayoutPrimitives'
import { OmnivoreSmallLogo } from '../../../elements/images/OmnivoreNameLogo'
import { theme } from '../../../tokens/stitches.config'
import { FunnelSimple } from '@phosphor-icons/react'
import { DiscoverHeaderProps } from './DiscoverHeader'
import { SmallTopBar } from './SmallTopBar'
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
        pl: '20px',
        pr: '20px',
        bg: '$readerBg',
        '@md': {
          display: 'none',
        },
      }}
    >
      <>
        <SmallTopBar {...props} selectedFeed={props.selectedFeedFilter} />
        <HStack
          alignment="center"
          distribution={'start'}
          css={{
            position: 'absolute',
            left: '10px',
            top: '60px',
            gap: '10px',
            width: '100%',
            paddingBottom: '5px',
            bg: '$readerBg',
            overflow: 'scroll',
            '::-webkit-scrollbar': {
              display: 'none',
            },
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
          }}
        >
          {typeof window !== 'undefined' && (window as any).omnivoreEnv?.USE_DISCOVER_AI && (
            <PinnedFeeds
              items={props.feeds}
              selected={props.selectedFeedFilter}
              applyFeedFilter={props.applyFeedFilter}
            />
          )}
        </HStack>
      </>
    </HStack>
  )
}
