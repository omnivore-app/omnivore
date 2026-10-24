import React, { useState } from "react"
import { InfoIcon } from '@phosphor-icons/react'
import { SpanBox } from '../../../elements/LayoutPrimitives'
import { theme } from '../../../tokens/stitches.config'

export type DiscoverSubjectInfoProps = {
  subject?: string | undefined
  topicSelected?: string | undefined
}

export function DiscoverSubjectInfo(props: DiscoverSubjectInfoProps): JSX.Element | null {
  const [showSubject, setShowSubject] = useState(false)
  const [mousePosition, setMousePosition] = useState<number[]>([0, 0])

  if (props.subject) {
    return (
      <>
        <SpanBox
          css={{
            position: 'relative',
            bottom: '17px',
            width: '100%',
            left: 'calc(100% - 5%)',
          }}
        >
          <InfoIcon
            style={{ cursor: 'pointer' }}
            color={theme.colors.grayText.toString()}
            onMouseEnter={(mouseEvent) => {
              setMousePosition([mouseEvent.pageX, mouseEvent.pageY])
              setShowSubject(true)
            }}
            onMouseLeave={() => {
              setShowSubject(false)
              setMousePosition([0, 0])
            }}
          ></InfoIcon>
        </SpanBox>

        {showSubject && (
          <SpanBox
            style={{
              backgroundColor: theme.colors.thNavMenuFooter.toString(),
              position: 'absolute',
              top: mousePosition[1],
              left:
                mousePosition[0] + 200 < window.innerWidth
                  ? mousePosition[0] + 10
                  : mousePosition[0] - 210,
              width: '200px',
              padding: '10px',
              color: theme.colors.thLibraryMenuUnselected.toString(),
              fontSize: '12px',
              fontWeight: '400',
              lineHeight: '1.25',
              borderRadius: '15px',
              zIndex: 10,
              boxShadow: theme.shadows.cardBoxShadow.toString(),
              fontFamily: theme.fonts.display.toString(),
            }}
          >
            This article was categorized as{' '}
            {props.topicSelected?.toString() ?? ''} due to it's similarity with
            articles in {props.subject}
          </SpanBox>
        )}
      </>
    )
  }

  return null
}
