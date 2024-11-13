import { HStack, VStack } from '../../../elements/LayoutPrimitives'
import { TopicBar } from './TopicBar'
import { Button } from '../../../elements/Button'
import { DiscoverHeaderProps } from './DiscoverHeader'
import React from 'react'
import { PinnedFeeds } from "./PinnedFeeds"
import { HeaderToggleGridIcon } from "../../../elements/icons/HeaderToggleGridIcon"
import { HeaderToggleListIcon } from "../../../elements/icons/HeaderToggleListIcon"
import { DiscoverShowAllIcon } from "../../../elements/icons/DiscoverShowAllIcon"
import { DiscoverHideHiddenIcon } from "../../../elements/icons/DiscoverHideHiddenIcon"

export function LargeHeaderLayout(props: DiscoverHeaderProps): JSX.Element {
  return (
    <HStack
      alignment="start"
      distribution="start"
      css={{
        height: '100%',
        width: '100%',
        boxSizing: 'border-box',
        '@mdDown': {
          display: 'none',
        },
      }}
    >
      <VStack css={{width: '100%'}} alignment={'start'} distribution={'center'}>
        <HStack
          alignment="center"
          distribution={'start'}
          css={{
            gap: '10px',
            width: '100%',

            '@mdDown': {
              width: '95%',
              display: 'none',
            },

          }}
        >
          <TopicBar
            setActiveTab={props.setActiveTab}
            activeTab={props.activeTab}
            topics={props.topics}
          />
          <Button
            style="plainIcon"
            css={{ display: 'flex', marginLeft: 'auto' }}
            onClick={(e) => {
              const visibility = props.discoverVisibility == 'HIDE_HIDDEN' ? 'SHOW_ALL' : 'HIDE_HIDDEN';
              props.setDiscoverVisibility(visibility);
              e.preventDefault()
            }}
          >
            {props.discoverVisibility == 'HIDE_HIDDEN' ? (
              <DiscoverHideHiddenIcon />
            ) : (
              <DiscoverShowAllIcon />
            )}
          </Button>
          <Button
            style="plainIcon"
            css={{ display: 'flex', marginLeft: 'auto' }}
            onClick={(e) => {
              props.setLayoutType(
                props.layout == 'GRID_LAYOUT' ? 'LIST_LAYOUT' : 'GRID_LAYOUT'
              )
              e.preventDefault()
            }}
          >
            {props.layout == 'LIST_LAYOUT' ? (
              <HeaderToggleGridIcon />
            ) : (
              <HeaderToggleListIcon />
            )}
          </Button>
        </HStack>
        <HStack
          alignment="center"
          distribution={'start'}
          css={{
            gap: '10px',
            width: '95%',
            paddingBottom: '5px',
            '@mdDown': {
              width: '95%',
            },

          }}
        >
          <PinnedFeeds items={props.feeds} selected={props.selectedFeedFilter} applyFeedFilter={props.applyFeedFilter} />
        </HStack>
      </VStack>
    </HStack>
  )
}
