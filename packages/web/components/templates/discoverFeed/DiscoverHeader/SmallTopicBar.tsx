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

  const scroll = (rightOrLeft: 'right' | 'left', interval = 1) => () => {
    const offset = rightOrLeft == 'right' ? +interval : -interval
    if (topicChild.current) {
      topicChild.current.scrollLeft += offset
    }
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
            onClick={scroll('left', 20)}
          />
          <HStack
            alignment={'start'}
            distribution={'start'}
            css={{ pl: '0px', pr: '15px', overflow: 'scroll',
              '::-webkit-scrollbar': {
                display: 'none',
              },
              msOverflowStyle: 'none',
              scrollbarWidth: 'none', }}
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
            onClick={scroll('right', 20)}
          />
        </HStack>
      </HStack>
    </>
  )
}
