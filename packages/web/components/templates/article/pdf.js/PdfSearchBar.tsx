import { HStack } from '../../../elements/LayoutPrimitives'
import React, { ChangeEvent, useEffect, useState } from 'react'
import { DEFAULT_HEADER_HEIGHT } from '../../homeFeed/HeaderSpacer'
import 'react-sliding-pane/dist/react-sliding-pane.css'
import 'pdfjs-dist/web/pdf_viewer.css'
import { EventBus, PDFViewer } from 'pdfjs-dist/types/web/pdf_viewer'
import { CaretLeft, CaretRight } from '@phosphor-icons/react'
import { SearchInput, ToolbarButton } from './Style'

export type PdfSearchProps = {
  pdfViewer: PDFViewer | null
  eventBus: EventBus | null
}

export default function PdfSearchBar(props: PdfSearchProps) {
  const [searchTerm, setSearchTerm] = useState<string | null>(null)
  const [hasResults, setHasResults] = useState(false)
  const [foundMatches, setFoundMatches] = useState(0)
  const [currentMatch, setCurrentMatch] = useState(1)

  useEffect(() => {
    if (props.eventBus) {
      props.eventBus.on(
        'updatefindmatchescount',
        (data: { matchesCount: { total: number } }) => {
          setHasResults(true)
          setCurrentMatch(1)
          setFoundMatches(data.matchesCount.total)
        }
      )
    }

    return () => {
      props.eventBus?.dispatch('find', { type: '', query: '' })
    }
  }, [props.eventBus])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm) {
        props.eventBus?.dispatch('find', {
          type: '',
          caseSensitive: false,
          findPrevious: false,
          highlightAll: true,
          phraseSearch: true,
          query: searchTerm,
        })
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, props.eventBus])

  const search = (input: ChangeEvent<HTMLInputElement>) =>
    setSearchTerm(input.target.value)

  const find = (forward: number) => () => {
    if (currentMatch < foundMatches && currentMatch + forward > 1) {
      props.eventBus?.dispatch('find', {
        type: 'again',
        caseSensitive: false,
        findPrevious: forward != 1,
        highlightAll: true,
        phraseSearch: true,
        query: searchTerm,
      })

      setCurrentMatch(currentMatch + forward)
    }
  }

  return (
    <HStack
      distribution="start"
      css={{
        position: 'fixed',
        alignItems: 'flex-start',
        width: '400px',
        right: '5px',
        padding: '5px',
        top: `calc(${DEFAULT_HEADER_HEIGHT} + 18px)`,
        height: '35px',
        borderTop: '1px solid black',
        boxShadow: 'rgba(61, 66, 78, 0.5) 0px 1px 2px 0px',
        background: '$thBackground4',
        zIndex: 100,
      }}
    >
      <SearchInput onChange={search} />
      <div
        style={{
          position: 'absolute',
          left: '280px',
          top: '10px',
          fontSize: '10px',
        }}
      >
        {hasResults ? `${currentMatch} of ${foundMatches}` : ''}
      </div>
      <div>
        <ToolbarButton
          onClick={find(-1)}
          css={{
            borderTopLeftRadius: '10px',
            borderBottomLeftRadius: '10px',
            backgroundColor: '$thBackground5',
          }}
        >
          <CaretLeft />
        </ToolbarButton>
        <ToolbarButton
          css={{
            borderTopRightRadius: '10px',
            borderBottomRightRadius: '10px',
            backgroundColor: '$thBackground5',
          }}
          onClick={find(1)}
        >
          <CaretRight />
        </ToolbarButton>
      </div>
    </HStack>
  )
}
