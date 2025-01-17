import {
  ArticleAttributes,
  LibraryItemNode,
} from '../../../../lib/networking/library_items/useLibraryItems'
import { Box } from '../../../elements/LayoutPrimitives'
import { v4 as uuidv4 } from 'uuid'
import {
  MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { DEFAULT_HEADER_HEIGHT } from '../../homeFeed/HeaderSpacer'
import { UserBasicData } from '../../../../lib/networking/queries/useGetViewerQuery'
import 'react-sliding-pane/dist/react-sliding-pane.css'
import 'pdfjs-dist/web/pdf_viewer.css'
import { EventBus, PDFViewer } from 'pdfjs-dist/types/web/pdf_viewer'
import { PDFPageView } from 'pdfjs-dist/types/web/pdf_page_view'
import { HighlightAction, HighlightBar } from '../../../patterns/HighlightBar'
import { isTouchScreenDevice } from '../../../../lib/deviceType'
import { ArticleMutations } from '../../../../lib/articleActions'
import { HighlightNoteModal } from '../HighlightNoteModal'
import type { Highlight } from '../../../../lib/networking/fragments/highlightFragment'

export type PdfArticleContainerProps = {
  viewer: UserBasicData
  article: ArticleAttributes
  containerRef: MutableRefObject<HTMLDivElement | null>
  pdfViewer: PDFViewer | null
  eventBus: EventBus | null
  sidebarActive: boolean

  articleMutations: ArticleMutations

  saveLatestPage: boolean
}

export default function PdfViewer(props: PdfArticleContainerProps) {
  const [highlights, setHighlights] = useState(props.article.highlights ?? [])
  const [pageCoordinates, setPageCoordinates] = useState<{
    pageX: number
    pageY: number
  }>({ pageX: 0, pageY: 0 })
  const [showHighlightModal, setShowHighlightModal] = useState(false)
  const [noteTarget, setNoteTarget] = useState<Highlight | undefined>(undefined)
  const [clickedHighlight, setClickedHighlight] =
    useState<Highlight | null>(null)
  const [currentPageNum, setCurrentPageNum] = useState(1)

  const colorMap: Record<string, string> = useMemo(
    () => ({
      yellow: 'rgba(255, 210, 52, 0.3)',
      red: 'rgba(251, 154, 154, 0.3)',
      green: 'rgba(85, 198, 137, 0.3)',
      blue: 'rgba(106, 177, 255, 0.3)',
    }),
    []
  )

  const addHighlightToPage = useCallback(
    (page: PDFPageView, highlight: Highlight) => {
      const scale = page.viewport.scale
      const element = document.createElement('div')
      element.id = highlight.id
      const boundingRects = JSON.parse(highlight.patch).rects
      const color = highlight.color || 'yellow'

      boundingRects.forEach((rect: number[]) => {
        const svgElement = document.createElement('svg')
        svgElement.className = 'highlight'
        svgElement.setAttribute('viewBox', '0 0 1 1')
        svgElement.style.borderRadius = '0px'
        svgElement.style.background = colorMap[color]
        svgElement.style.position = 'absolute'
        svgElement.style.top = `${rect[0] * scale}px`
        svgElement.style.left = `${rect[1] * scale}px`
        svgElement.style.width = `${rect[2] * scale}px`
        svgElement.style.height = `${rect[3] * scale}px`
        svgElement.style.cursor = 'pointer'
        svgElement.style.zIndex = '3'

        svgElement.innerHTML = ``
        svgElement.innerHTML += `
          <defs>
            <path id="path_p1_2" vector-effect="non-scaling-stroke" d="M0 1 V0 H1 V1 Z"></path>
            <clipPath id="clip_path_p1_2" clipPathUnits="objectBoundingBox">
              <use href="#path_p1_2" class="clip"></use>
            </clipPath></defs>
            <use href="#path_p1_2"></use>
       `

        svgElement.addEventListener('click', (evt) => {
          setClickedHighlight(highlight)
          setPageCoordinates({ pageX: evt.clientX, pageY: evt.clientY })
          setShowHighlightModal(true)
        })

        element.prepend(svgElement)
      })

      page.div.children[0].append(element)
    },
    [colorMap]
  )

  const getBoundingRects = (
    canvasBoundingBox: DOMRect,
    highlightBoundingBoxes: DOMRectList,
    scaleFactor: number
  ): number[][] => {
    const rects = Array.from(highlightBoundingBoxes).map((rect) => [
      (rect.top - canvasBoundingBox.y) / scaleFactor,
      (rect.left - canvasBoundingBox.x) / scaleFactor,
      rect.width / scaleFactor,
      rect.height / scaleFactor,
    ])

    return Object.values(
      rects.reduce((acc, curr) => {
        acc[`l${curr[1]}w${curr[2]}}`] = curr
        return acc
      }, {} as Record<string, number[]>)
    )
  }

  const addNoteToNewHighlight = async (
    note: string | undefined,
    noteTarget: Highlight
  ) => {
    if (props.pdfViewer && props.pdfViewer._pages) {
      const currentPageIndex = props.pdfViewer.currentPageNumber - 1
      const page = props.pdfViewer._pages[currentPageIndex]
      const highlight = await props.articleMutations.createHighlightMutation({
        id: noteTarget.id,
        shortId: noteTarget.id.slice(0, 12),
        articleId: noteTarget.libraryItem?.id ?? props.article.id,
        quote: noteTarget.quote,
        color: noteTarget?.color || 'yellow',
        patch: noteTarget.patch,
        highlightPositionAnchorIndex: noteTarget.highlightPositionAnchorIndex,
        annotation: note,
      })
      if (highlight) {
        addHighlightToPage(page, highlight)
        setHighlights([...highlights, highlight])
      }
      return highlight
    }
  }

  const copyHighlightedText = async (quote: string) => {
    await navigator.clipboard.writeText(quote)
  }

  const viewNoteTextForClickedHighlight = (clickedHighlight: Highlight) => {
    setNoteTarget(clickedHighlight)
  }

  const updateColorForClickedHighlight = async (
    pdfPage: PDFPageView,
    clickedHighlight: Highlight,
    newColor: string
  ) => {
    await props.articleMutations.updateHighlightMutation({
      highlightId: clickedHighlight.id,
      color: newColor,
    })

    document.getElementById(clickedHighlight.id)?.remove()
    clickedHighlight.color = newColor
    addHighlightToPage(pdfPage, clickedHighlight)

    setClickedHighlight(null)
  }

  const createHighlightWithNote = (
    id: string,
    quote: string,
    pageNumber: number,
    rects: number[][]
  ) => {
    setNoteTarget({
      id,
      type: 'HIGHLIGHT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sharedAt: new Date().toISOString(),
      createdByMe: true,
      shortId: id.slice(0, 12),
      libraryItem: { id: props.article.id } as unknown as LibraryItemNode,
      quote,
      color: 'yellow',
      patch: JSON.stringify({ page: pageNumber + 1, rects }),
      highlightPositionAnchorIndex: pageNumber + 1,
    })
    setShowHighlightModal(false)
  }

  const createHighlightFromColour = async (
    id: string,
    quote: string,
    color: string,
    page: PDFPageView,
    pageNumber: number,
    rects: number[][]
  ) => {
    const highlight = await props.articleMutations.createHighlightMutation({
      id,
      shortId: id.slice(0, 12),
      articleId: props.article.id,
      quote,
      color,
      patch: JSON.stringify({ page: pageNumber, rects }),
      highlightPositionAnchorIndex: pageNumber,
    })

    if (highlight) {
      addHighlightToPage(page as PDFPageView, highlight)
      setHighlights([...highlights, highlight])
    }
  }

  const onAddHighlightClick = async (
    action: HighlightAction,
    param?: string
  ) => {
    setShowHighlightModal(false)

    if (props.pdfViewer?._pages && window) {
      const id = uuidv4()

      const clientRects = window.getSelection()?.getRangeAt(0).getClientRects()
      const scaleFactor = props.pdfViewer._pages[0].viewport.scale
      const currentPageNumber = props.pdfViewer.currentPageNumber
      const page = props.pdfViewer._pages[currentPageNumber - 1]

      const canvas = document.querySelector(
        `[data-page-number='${currentPageNumber}']`
      )?.children[0]
      const canvasRect = canvas?.getBoundingClientRect()

      const quote = window.getSelection()?.toString()

      const isTextHighlighted = clientRects && clientRects.length > 0 && quote
      // We copy the highlighted text.
      // If a highlight is selected, we copy the text from that instead.
      if (action == 'copy') {
        return copyHighlightedText(clickedHighlight?.quote ?? quote ?? '')
      }

      if (action == 'comment' && !quote && clickedHighlight) {
        return viewNoteTextForClickedHighlight(clickedHighlight)
      }

      if (action == 'updateColor' && clickedHighlight) {
        return updateColorForClickedHighlight(
          page,
          clickedHighlight,
          param ?? 'yellow'
        )
      }

      if (isTextHighlighted && canvasRect) {
        const rects = getBoundingRects(canvasRect, clientRects, scaleFactor)

        if (action == 'comment') {
          return createHighlightWithNote(id, quote, currentPageNumber, rects)
        }

        if (action == 'create') {
          return createHighlightFromColour(
            id,
            quote,
            param || 'yellow',
            page,
            currentPageNumber,
            rects
          )
        }
      }
    }
  }

  // Here we detect whether some text has been highlighted. If it has, we view the
  // highlight modal.
  useEffect(() => {
    const detectHighlightedText = () => {
      if (window) {
        const clientRectsArray = Array.from(
          window.getSelection()?.getRangeAt(0).getClientRects() ?? []
        )
        const quote = window.getSelection()?.toString()

        if (clientRectsArray.length > 0 && quote) {
          const rect = clientRectsArray[clientRectsArray.length - 1]
          setPageCoordinates({ pageX: rect.x + 10, pageY: rect.y + 15 })
          setShowHighlightModal(true)
          setClickedHighlight(null)

          return
        }

        setPageCoordinates({ pageX: -1000, pageY: -1000 })
        setShowHighlightModal(false)
      }
    }

    if (props.containerRef?.current) {
      const isTouch = isTouchScreenDevice()

      if (!isTouch) {
        props.containerRef.current.addEventListener(
          'mouseup',
          detectHighlightedText
        )
      }

      if (isTouch) {
        props.containerRef.current.addEventListener(
          'touchend',
          detectHighlightedText
        )
      }
    }

    return () => {
      if (props.containerRef && props.containerRef.current) {
        props.containerRef?.current.removeEventListener(
          'mouseup',
          detectHighlightedText
        )

        props.containerRef.current.addEventListener(
          'touchend',
          detectHighlightedText
        )
      }
    }
  }, [
    props.containerRef,
    setPageCoordinates,
    setShowHighlightModal,
    props.pdfViewer,
    setHighlights,
    highlights,
  ])

  // When a page zooms, it internally re-renders using pdf.js. We add a function
  // to ensure that when a page newly renders that we re-add all the highlights,
  // as those are removed.
  useEffect(() => {
    const render = (data: { source: PDFPageView }) => {
      const page = data.source
      if (page) {
        highlights
          ?.filter((it) => it.highlightPositionAnchorIndex == page.id)
          .forEach((it) => addHighlightToPage(page as PDFPageView, it))
      }
    }
    const setPage = (e: { pageNumber: number }) =>
      setCurrentPageNum(e.pageNumber)

    if (props.eventBus && props.pdfViewer) {
      props.eventBus.on('textlayerrendered', render)
      props.eventBus.on('pagechanging', setPage)
    }

    return () => {
      if (props.eventBus) {
        props.eventBus.off('textlayerrendered', render)
        props.eventBus.off('pagechanging', setPage)
      }
    }
  }, [props.eventBus, props.pdfViewer, highlights, addHighlightToPage])

  // Here is where we add our percentage read markers. We debounce for 2.5s before
  // adding. We also set the page number so that we can go back to the correct
  // page on reload.
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null
    const savePercentOnScroll = () => {
      timeoutId && clearTimeout(timeoutId)
      setShowHighlightModal(false)

      timeoutId = setTimeout(async () => {
        if (props.containerRef && props.containerRef.current) {
          const bottomProgress =
            (props.containerRef.current.scrollTop +
              props.containerRef.current.clientHeight) /
            props.containerRef.current.scrollHeight

          await props.articleMutations.articleReadingProgressMutation({
            id: props.article.id,
            readingProgressTopPercent: bottomProgress * 100,
            readingProgressPercent: bottomProgress * 100,
            readingProgressAnchorIndex: currentPageNum + 1,
            force: !props.saveLatestPage // Force will overwrite, even if it's a previous page num.
          })
        }
      }, 2500)
    }

    if (props.containerRef?.current) {
      props.containerRef.current.addEventListener('scroll', savePercentOnScroll)
    }

    return () => {
      if (props.containerRef?.current) {
        timeoutId && clearTimeout(timeoutId)
        props.containerRef.current.removeEventListener(
          'scroll',
          savePercentOnScroll
        )
      }
    }
  }, [
    props.containerRef,
    currentPageNum,
    props.article.id,
    props.articleMutations,
  ])

  return (
    <Box id="article-wrapper" css={{ flexGrow: 1 }}>
      {noteTarget && (
        <HighlightNoteModal
          highlight={clickedHighlight ?? undefined}
          libraryItemId={props.article.id}
          libraryItemSlug={props.article.slug}
          createHighlightForNote={(note: string | undefined) => {
            if (noteTarget) {
              return addNoteToNewHighlight(note, noteTarget)
            }

            return Promise.resolve(noteTarget)
          }}
          onUpdate={(updatedHighlight: Highlight) => {
            const indexOf = highlights?.findIndex(
              (it) => it.id == updatedHighlight.id
            )
            if (indexOf && indexOf > -1) {
              highlights[indexOf] = updatedHighlight
              setHighlights(highlights)
            }
            setClickedHighlight(null)
          }}
          onOpenChange={() => {
            setNoteTarget(undefined)
          }}
        />
      )}

      {showHighlightModal && (
        <>
          <HighlightBar
            anchorCoordinates={pageCoordinates}
            isNewHighlight={!clickedHighlight}
            handleButtonClick={onAddHighlightClick}
            isSharedToFeed={false}
            displayAtBottom={isTouchScreenDevice()}
            highlightColor={clickedHighlight?.color || 'yellow'}
          />
        </>
      )}
      <div
        ref={props.containerRef}
        className={'viewerContainer'}
        style={{
          width: `calc(100% - ${props.sidebarActive ? '250px' : '0px'})`,
          left: !props.sidebarActive ? 0 : '250px',
          height: `calc(100vh - ${DEFAULT_HEADER_HEIGHT} - 20px)`,
          overflow: 'scroll',
          top: '100px',
          position: 'absolute',
        }}
      >
        <div id="viewer" className="pdfViewer"></div>
      </div>
    </Box>
  )
}
