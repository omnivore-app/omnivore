import {
  ArticleAttributes,
} from '../../../lib/networking/library_items/useLibraryItems'
import { Box } from '../../elements/LayoutPrimitives'
import { useState, useRef } from 'react'
import type { Highlight } from '../../../lib/networking/fragments/highlightFragment'
import { HighlightNoteModal } from './HighlightNoteModal'
import { DEFAULT_HEADER_HEIGHT } from '../homeFeed/HeaderSpacer'
import { UserBasicData } from '../../../lib/networking/queries/useGetViewerQuery'
import 'react-sliding-pane/dist/react-sliding-pane.css'
import { NotebookContent } from './Notebook'
import { NotebookHeader } from './NotebookHeader'
import useWindowDimensions from '../../../lib/hooks/useGetWindowDimensions'
import { ResizableSidebar } from './ResizableSidebar'


export type PdfArticleContainerProps = {
  viewer: UserBasicData
  article: ArticleAttributes
  showHighlightsModal: boolean
  setShowHighlightsModal: React.Dispatch<React.SetStateAction<boolean>>
}

export default function NativePdfArticleContainer(
  props: PdfArticleContainerProps
): JSX.Element {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [noteTarget, setNoteTarget] = useState<Highlight | undefined>(undefined)
    useState<number | undefined>(undefined)
  const highlightsRef = useRef<Highlight[]>([])


  const windowDimensions = useWindowDimensions()

  return (
    <Box
      id="article-wrapper"
      css={{
        width: '100%',
        height: `calc(100vh - ${DEFAULT_HEADER_HEIGHT})`,
      }}
    >
      <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
        <embed src={props.article.url} width={windowDimensions.width} height={windowDimensions.height} />
      </div>
      {noteTarget && (
        <HighlightNoteModal
          highlight={noteTarget}
          libraryItemId={props.article.id}
          libraryItemSlug={props.article.slug}
          onUpdate={(highlight: Highlight) => {
            const savedHighlight = highlightsRef.current.find(
              (other: Highlight) => {
                return other.id == highlight.id
              }
            )

            if (savedHighlight) {
              savedHighlight.annotation = highlight.annotation
            }
          }}
          onOpenChange={() => {
            setNoteTarget(undefined)
          }}
        />
      )}
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
            const event = new CustomEvent('scrollToHighlightId', {
              detail: highlightId,
            })
            document.dispatchEvent(event)
          }}
        />
      </ResizableSidebar>
    </Box>
  )
}
