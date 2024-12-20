import {
  ArticleAttributes,
  ArticleReadingProgressMutationInput,
  useUpdateItemReadStatus,
} from '../../../../lib/networking/library_items/useLibraryItems'
import { HStack, VStack } from '../../../elements/LayoutPrimitives'
import React, { useEffect, useRef, useState } from 'react'
import { UserBasicData } from '../../../../lib/networking/queries/useGetViewerQuery'
import 'react-sliding-pane/dist/react-sliding-pane.css'
import {
  CreateHighlightInput,
  useCreateHighlight,
  useDeleteHighlight,
  useMergeHighlight,
  useUpdateHighlight,
} from '../../../../lib/networking/highlights/useItemHighlights'
import 'pdfjs-dist/web/pdf_viewer.css'
import { EventBus, PDFViewer } from 'pdfjs-dist/types/web/pdf_viewer'
import PdfViewer from './PdfViewer'
import PdfToolbar from './PdfToolbar'
import PdfSearchBar from './PdfSearchBar'
import { NotebookHeader } from '../NotebookHeader'
import { NotebookContent } from '../Notebook'
import { ResizableSidebar } from '../ResizableSidebar'
import { PDFDocumentProxy } from 'pdfjs-dist'
import { PDFLinkService } from 'pdfjs-dist/types/web/pdf_link_service'
import PdfSideBar from './PdfSideBar'

export type PdfArticleContainerProps = {
  viewer: UserBasicData
  article: ArticleAttributes
  showHighlightsModal: boolean
  setShowHighlightsModal: React.Dispatch<React.SetStateAction<boolean>>
}

export default function PdfArticleContainer(props: PdfArticleContainerProps) {
  // @ts-ignore
  const pdfJS = import('pdfjs-dist/build/pdf.min.mjs')
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [pdfViewer, setPdfViewer] = useState<PDFViewer | null>(null)
  const [eventBus, setEventBus] = useState<EventBus | null>(null)
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [pageCount, setTotalPageCount] = useState<number>(0)
  const [showSearch, setShowSearch] = useState(false)
  const [showToolbar, setShowToolbar] = useState(true)
  const [saveLatestPage, setSaveLatestPage] = useState(true);

  const [sidebarActive, setSidebarActive] = useState<boolean>(false)

  const createHighlight = useCreateHighlight()
  const deleteHighlight = useDeleteHighlight()
  const mergeHighlight = useMergeHighlight()
  const updateHighlight = useUpdateHighlight()
  const updateItemReadStatus = useUpdateItemReadStatus()

  const createPdfViewer = async (): Promise<PDFViewer> => {
    const pdfJSLib = await pdfJS
    const pdfjsViewer = await import('pdfjs-dist/web/pdf_viewer.mjs')

    pdfJSLib.GlobalWorkerOptions.workerSrc =
      window.location.origin + '/pdfjs-dist/pdf.worker.min.mjs'

    const eventBus = new pdfjsViewer.EventBus()
    const pdfLinkService = new pdfjsViewer.PDFLinkService({
      eventBus,
    })
    const pdfFindController = new pdfjsViewer.PDFFindController({
      eventBus,
      linkService: pdfLinkService,
    })

    const pdfScriptingManager = new pdfjsViewer.PDFScriptingManager({
      eventBus,
      sandboxBundleSrc: window.location.origin + '/pdfjs-dist/pdf.sandbox.mjs',
    })

    const pdfViewer = new pdfjsViewer.PDFViewer({
      container: containerRef.current!,
      eventBus,
      linkService: pdfLinkService,
      findController: pdfFindController,
      scriptingManager: pdfScriptingManager,
    })
    pdfScriptingManager.setViewer(pdfViewer)
    pdfLinkService.pdfViewer = pdfViewer

    return pdfViewer
  }

  const loadPdfDocument = async (): Promise<PDFDocumentProxy> => {
    const pdfJsLib = await pdfJS
    const loadingTask = pdfJsLib.getDocument({
      url: props.article.url,
      cMapUrl: window.location.origin + '/pdfjs-dist/cmaps/',
      cMapPacked: true,
      enableXfa: true,
    })

    return loadingTask.promise
  }

  useEffect(() => {
    // Uses the existing mechanism to hide the reader toolbar from pspdfkit
    const updateReaderSettings = () => {
      const show = localStorage.getItem('reader-show-pdf-tool-bar')
      const showBar = show ? JSON.parse(show) == true : false
      setShowToolbar(showBar)

      const latestPage = localStorage.getItem('reader-remember-latest-page')
      const latestPageSave = latestPage ? JSON.parse(latestPage) == true : false
      setSaveLatestPage(latestPageSave)
    }

    document.addEventListener('pdfReaderUpdateSettings', updateReaderSettings)
    updateReaderSettings();

    ;(async () => {
      const pdfViewer = await createPdfViewer()
      const pdfDocument = await loadPdfDocument()

      setTotalPageCount(pdfDocument.numPages)
      pdfViewer.setDocument(pdfDocument)

      const linkService = pdfViewer.linkService as PDFLinkService
      linkService.setDocument(pdfDocument, null)

      // Doesn't seem to get applied straight away, causing an issue where the scale would
      // be set to 0. We do a 200 ms timeout to avoid this bug.
      setTimeout(() => {
        pdfViewer.currentScale = 1
        pdfViewer.scrollPageIntoView({
          pageNumber: props.article.readingProgressAnchorIndex,
        })
      }, 200)

      setPdfViewer(pdfViewer)
      setEventBus(pdfViewer.eventBus)

      pdfViewer.eventBus.on(
        'pagechanging',
        (e: { previous: number; pageNumber: number }) => {
          console.log('Page Changing....')
          setPageNumber(e.pageNumber)
        }
      )
    })()
  }, [])

  return (
    <VStack css={{ width: '100%' }}>
      {showSearch && <PdfSearchBar pdfViewer={pdfViewer} eventBus={eventBus} />}
      {showToolbar && (
        <PdfToolbar
          setShowSidebar={setSidebarActive}
          sidebarActive={sidebarActive}
          viewer={props.viewer}
          article={props.article}
          pdfViewer={pdfViewer}
          eventBus={eventBus}
          pageNumber={pageNumber}
          setPageNumber={setPageNumber}
          totalPageNumbers={pageCount}
          showSearch={showSearch}
          setShowSearch={setShowSearch}
        />
      )}

      <HStack>
        <PdfSideBar
          setPage={(page: number) => {
            if (pdfViewer) {
              pdfViewer.currentPageNumber = page
            }
          }}
          pdfDocument={pdfViewer?.pdfDocument}
          activePage={pageNumber}
          sidebarActive={sidebarActive}
          totalPages={pageCount}
        />
        <PdfViewer
          viewer={props.viewer}
          article={props.article}
          containerRef={containerRef}
          eventBus={eventBus}
          sidebarActive={sidebarActive}
          saveLatestPage={saveLatestPage}
          pdfViewer={pdfViewer}
          articleMutations={{
            createHighlightMutation: async (input: CreateHighlightInput) => {
              try {
                return await createHighlight.mutateAsync({
                  itemId: props.article.id,
                  slug: props.article.slug,
                  input,
                })
              } catch (err) {
                console.log('error creating highlight', err)
                return undefined
              }
            },
            deleteHighlightMutation: async (
              _libraryItemId: string,
              highlightId: string
            ) => {
              try {
                await deleteHighlight.mutateAsync({
                  itemId: props.article.id,
                  slug: props.article.slug,
                  highlightId,
                })
                return true
              } catch (err) {
                console.log('error deleting highlight', err)
                return false
              }
            },
            mergeHighlightMutation: async (input) => {
              try {
                const result = await mergeHighlight.mutateAsync({
                  itemId: props.article.id,
                  slug: props.article.slug,
                  input,
                })
                return result?.highlight
              } catch (err) {
                console.log('error merging highlight', err)
                return undefined
              }
            },
            updateHighlightMutation: async (input) => {
              try {
                const result = await updateHighlight.mutateAsync({
                  itemId: props.article.id,
                  slug: props.article.slug,
                  input,
                })
                return result?.id
              } catch (err) {
                console.log('error updating highlight', err)
                return undefined
              }
            },
            articleReadingProgressMutation: async (
              input: ArticleReadingProgressMutationInput
            ) => {
              try {
                await updateItemReadStatus.mutateAsync({
                  itemId: props.article.id,
                  slug: props.article.slug,
                  input,
                })
              } catch {
                return false
              }
              return true
            },
          }}
        />
      </HStack>
      <ResizableSidebar
        isShow={props.showHighlightsModal}
        onClose={() => {
          props.setShowHighlightsModal(false)
        }}
      >
        <NotebookHeader
          viewer={props.viewer}
          item={props.article}
          setShowNotebook={props.setShowHighlightsModal}
        />
        <NotebookContent
          viewer={props.viewer}
          item={props.article}
          viewInReader={(highlightId) => {
            const highlight = props.article.highlights?.filter(
              (it) => it.id == highlightId
            )
            if (highlight && highlight.length == 1) {
              const pageId = highlight[0].highlightPositionAnchorIndex

              if (pdfViewer) {
                pdfViewer.currentPageNumber = pageId ?? 1
              }
            }
          }}
        />
      </ResizableSidebar>
    </VStack>
  )
}
