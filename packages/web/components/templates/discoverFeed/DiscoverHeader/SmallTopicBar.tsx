import { HStack } from '../../../elements/LayoutPrimitives'
import { TopicTab } from './TopicTab'
import { CaretLeft, CaretRight } from '@phosphor-icons/react'
import React, { useEffect, useRef, useState } from 'react'
import { TopicTabData } from '../DiscoverContainer'

export type TopicBarProps = {
  activeTab: TopicTabData
  setActiveTab: (tab: TopicTabData) => void
  topics: TopicTabData[]
}
export function SmallTopicBar(props: TopicBarProps): JSX.Element {
  const [overflowing, setOverflowing] = useState(false)
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
    const offset = rightOrLeft == 'right' ? +1 : -1
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

  return (
    <>
      <HStack
        alignment="start"
        distribution="evenly"
        css={{ width: '100%', height: '100%' }}
      >
        <HStack
          ref={topicParent}
          alignment={'center'}
          distribution={'start'}
          css={{
            overflow: 'hidden',
            position: 'relative',
            flexGrow: '1',
            width: '0px',
          }}
        >
          <CaretLeft
            size={18}
            style={{
              pointerEvents: 'all',
              cursor: 'pointer',
              minWidth: '40px',
              width: '40px',
            }}
            onMouseEnter={scroll('left')}
            onMouseLeave={clearScroll}
          />
          <HStack
            alignment={'start'}
            distribution={'start'}
            css={{ pl: '15px', pr: '15px', overflow: 'hidden' }}
            ref={topicChild}
          >
            {(props.topics ?? []).map((topic) => {
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
            })}
          </HStack>
          <CaretRight
            size={18}
            style={{
              pointerEvents: 'all',
              cursor: 'pointer',
              minWidth: '40px',
              width: '40px',
            }}
            onMouseEnter={scroll('right')}
            onMouseLeave={clearScroll}
          />
        </HStack>
      </HStack>
    </>
  )
}
