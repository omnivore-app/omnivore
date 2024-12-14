import { ArticleAttributes } from '../../../../lib/networking/library_items/useLibraryItems'
import { HStack } from '../../../elements/LayoutPrimitives'
import React, { useState } from 'react'
import { DEFAULT_HEADER_HEIGHT } from '../../homeFeed/HeaderSpacer'
import { UserBasicData } from '../../../../lib/networking/queries/useGetViewerQuery'
import 'react-sliding-pane/dist/react-sliding-pane.css'
import 'pdfjs-dist/web/pdf_viewer.css'
import { EventBus, PDFViewer } from 'pdfjs-dist/types/web/pdf_viewer'
import {
  CaretLeft,
  CaretRight,
  CornersIn,
  Download,
  FrameCorners,
  MagnifyingGlass,
  MagnifyingGlassMinus,
  MagnifyingGlassPlus,
  Sidebar,
} from '@phosphor-icons/react'
import { PageInput, ToolbarButton, ToolbarIconButton } from './Style'

export type PdfArticleToolbarProps = {
  viewer: UserBasicData
  article: ArticleAttributes
  pdfViewer: PDFViewer | null
  eventBus: EventBus | null

  pageNumber: number
  totalPageNumbers: number
  setPageNumber: React.Dispatch<React.SetStateAction<number>>

  showSearch: boolean
  setShowSearch: React.Dispatch<React.SetStateAction<boolean>>

  setShowSidebar: React.Dispatch<React.SetStateAction<boolean>>
  sidebarActive: boolean
}

export default function PdfToolbar(props: PdfArticleToolbarProps): JSX.Element {
  const [zoomMode, setZoomMode] = useState('page-fit')

  const zoom = (step: number) => () => {
    setZoomMode('zoom')
    if (step == 1) {
      props.pdfViewer?.increaseScale({ steps: 1 })
      return
    }

    props.pdfViewer?.decreaseScale()
  }

  const changePage = (step: number) => () => {
    setPage({ target: { value: (props.pageNumber + step).toString() } })
  }

  const setPage = (e: { target: { value: string } }) => {
    const newPage = e.target.value
    if (!isNaN(parseInt(newPage))) {
      const clamped = Math.max(
        1,
        Math.min(parseInt(newPage), props.totalPageNumbers)
      )
      props.setPageNumber(clamped)
      if (props.pdfViewer) {
        props.pdfViewer.currentPageNumber = clamped
      }
    }
  }

  const zoomModeToggle = async () => {
    const newZoomMode = zoomMode == 'page-fit' ? 'zoom' : 'page-fit'
    setZoomMode(newZoomMode)

    if (newZoomMode == 'page-fit') {
      if (props.pdfViewer) {
        props.pdfViewer.currentScaleValue = 'page-fit'
      }
      return
    }

    if (props.pdfViewer) {
      const pdfPage = await props.pdfViewer.pdfDocument?.getPage(
        props.pageNumber
      )
      const viewPort = pdfPage!.getViewport({
        scale: 1700 / pdfPage!.getViewport({ scale: 1.0 }).width,
      })
      props.pdfViewer.currentScale = viewPort.scale
    }
  }

  return (
    <HStack
      distribution="start"
      css={{
        position: 'fixed',
        alignItems: 'flex-start',
        width: '100%',
        top: `calc(${DEFAULT_HEADER_HEIGHT} - 25px)`,
        height: '44px',
        lineHeight: '40px',
        borderTop: '1px solid black',
        boxShadow: 'rgba(61, 66, 78, 0.5) 0px 1px 2px 0px',
        background: '$thBackground2',
        fontSize: '24px',
        zIndex: 2,
      }}
    >
      <ToolbarIconButton onClick={() => props.setShowSidebar(!props.sidebarActive)} css={ props.sidebarActive ? { background: '$thBackground' } : {}}>
        <Sidebar />
      </ToolbarIconButton>
      <HStack style={{ padding: '2px 10px 0 10px' }}>
        <span style={{ fontSize: '16px ' }}>Page {'  '}</span>
        <HStack
          style={{ paddingLeft: '5px', paddingRight: '5px', margin: 'auto' }}
        >
          <ToolbarButton
            onClick={changePage(-1)}
            css={{
              borderTopLeftRadius: '10px',
              borderBottomLeftRadius: '10px',
              '@media only screen and (min-device-width: 20em) and (max-device-width: 30em)': {
                display: 'none'
              }
            }}
          >
            <CaretLeft />
          </ToolbarButton>
          <PageInput
            type="number"
            name="pageNumber"
            onChange={setPage}
            value={props.pageNumber}
          />
          <ToolbarButton
            onClick={changePage(1)}
            css={{
              borderTopRightRadius: '10px',
              borderBottomRightRadius: '10px',
              backgroundColor: '$thBackground5',
              '@media only screen and (min-device-width: 20em) and (max-device-width: 30em)': {
                display: 'none'
              }
            }}
          >
            <CaretRight />
          </ToolbarButton>
        </HStack>
        <span style={{ fontSize: '16px' }}>
          {'  '} of {props.totalPageNumbers}
        </span>
      </HStack>
      <HStack>
        <ToolbarIconButton onClick={zoom(-1)}>
          <MagnifyingGlassMinus />
        </ToolbarIconButton>
        <ToolbarIconButton onClick={zoom(1)}>
          <MagnifyingGlassPlus />
        </ToolbarIconButton>
        <ToolbarIconButton onClick={zoomModeToggle}>
          {zoomMode == 'page-fit' ? <FrameCorners /> : <CornersIn />}
        </ToolbarIconButton>
      </HStack>

      <div style={{ flexGrow: 1 }}></div>
      <HStack>
        <ToolbarIconButton
          onClick={() => props.setShowSearch(!props.showSearch)}
          css={{ backgroundColor: props.showSearch ? '$thBackground' : 'none' }}
        >
          <MagnifyingGlass />
        </ToolbarIconButton>
        <a
          href={props.article.url}
          target="_blank"
          download
          style={{ all: 'unset' }}
        >
          <ToolbarIconButton>
            <Download />
          </ToolbarIconButton>
        </a>
      </HStack>
    </HStack>
  )
}
