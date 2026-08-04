import { Box, HStack } from '../../../elements/LayoutPrimitives'
import { TopicTab } from './TopicTab'
import { CaretLeft, CaretRight } from '@phosphor-icons/react'
import React, { useEffect, useRef, useState } from 'react'
import { TopicTabData } from '../DiscoverContainer'
import { DiscoverFeed } from '../../../../lib/networking/queries/useGetDiscoverFeeds'
import { PinnedFeeds } from './PinnedFeeds'

export type TopBarProps = {
  activeTab: TopicTabData
  setActiveTab: (tab: TopicTabData) => void
  topics: TopicTabData[]
  feeds: DiscoverFeed[]
  selectedFeed: string
  applyFeedFilter: (feedFilter: string) => void
}

export function TopBar(props: TopBarProps): JSX.Element {
  const [overflowing, setOverflowing] = useState(true)
  let scrollToken: NodeJS.Timer | null = null
  const topicParent = useRef<HTMLDivElement>(null)
  const topicChild = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleResize = () => {
      if (
        topicChild.current &&
        topicParent.current &&
        topicChild.current.offsetWidth < topicChild.current.scrollWidth
      ) {
        setOverflowing(true)
        return
      }

      setOverflowing(false)
    }

    handleResize()

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const scroll = (rightOrLeft: 'right' | 'left') => () => {
    const offset = rightOrLeft == 'right' ? +5 : -5
    scrollToken = setInterval(() => {
      if (topicChild.current) {
        topicChild.current.scrollLeft += offset
      }
    })
  }

  const clearScroll = () => {
    clearInterval(scrollToken as NodeJS.Timeout)
    scrollToken = null
  }

  const showTopics = () => {
    return props.topics.map((topic) => {
      return (
        <TopicTab
          key={topic.title + props.activeTab.title}
          title={topic.title}
          selected={props.activeTab.title == topic.title}
          onClick={() => {
            props.setActiveTab(topic)
          }}
        />
      )
    })
  }

  const showFeeds = () => {
    return (
      <PinnedFeeds
        items={props.feeds}
        selected={props.selectedFeed}
        applyFeedFilter={props.applyFeedFilter}
        topFeed={true}
      />
    )
  }

  return (
    <Box
      css={{
        height: '38px',
        width: 'calc(100% - 80px)',
        bg: '$thLibrarySearchbox',

        borderRadius: '6px',
        border: '2px solid transparent',
        boxShadow:
          '0 1px 3px 0 rgba(0, 0, 0, 0.1),0 1px 2px 0 rgba(0, 0, 0, 0.06);',
        '@media (max-width: 930px)': {
          width: '420px',
        },
      }}
    >
      <HStack
        alignment="center"
        distribution="start"
        css={{ width: '100%', height: '100%' }}
      >
        <HStack
          alignment="center"
          distribution="start"
          css={{
            height: '100%',
          }}
          onClick={(e) => {
            e.preventDefault()
          }}
        ></HStack>
        <form style={{ width: '100%' }}>
          <HStack
            ref={topicParent}
            alignment={'start'}
            distribution={'start'}
            css={{
              position: 'relative',
              overflow: 'hidden',
              '@media (max-width: 930px)': {
                width: '400px',
              },
            }}
          >
            {overflowing && (
              <HStack
                alignment={'center'}
                distribution={'between'}
                css={{
                  position: 'absolute',
                  pl: '3px',
                  pr: '3px',
                  width: '100%',
                  top: 'calc(50% - 9px)',
                  pointerEvents: 'none',
                }}
              >
                <CaretLeft
                  size={18}
                  style={{ pointerEvents: 'all', cursor: 'pointer' }}
                  onMouseEnter={scroll('left')}
                  onMouseLeave={clearScroll}
                />
                <CaretRight
                  size={18}
                  style={{ pointerEvents: 'all', cursor: 'pointer' }}
                  onMouseEnter={scroll('right')}
                  onMouseLeave={clearScroll}
                />
              </HStack>
            )}

            <HStack
              alignment={'start'}
              distribution={'start'}
              css={{ pl: '15px', pr: '15px', overflow: 'hidden' }}
              ref={topicChild}
            >
              {typeof window !== 'undefined' && (window as any).omnivoreEnv?.USE_DISCOVER_AI
                ? showTopics()
                : showFeeds()}
            </HStack>
          </HStack>
        </form>
      </HStack>
    </Box>
  )
}
