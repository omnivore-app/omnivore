/* eslint-disable react/no-children-prop */
import { useMemo, useState } from 'react'
import type { Highlight } from '../../lib/networking/fragments/highlightFragment'
import { LabelChip } from '../elements/LabelChip'
import {
  Box,
  VStack,
  Blockquote,
  SpanBox,
  HStack,
} from '../elements/LayoutPrimitives'
import { styled, theme } from '../tokens/stitches.config'
import { HighlightViewNote } from './HighlightNotes'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { isDarkTheme } from '../../lib/themeUpdater'
import { HighlightsMenu } from '../templates/homeFeed/HighlightItem'
import { ReadableItem } from '../../lib/networking/queries/useGetLibraryItemsQuery'
import { UserBasicData } from '../../lib/networking/queries/useGetViewerQuery'
import {
  autoUpdate,
  offset,
  size,
  useFloating,
  useHover,
  useInteractions,
} from '@floating-ui/react'
import { LibraryHoverActions } from './LibraryCards/LibraryHoverActions'
import { HighlightHoverActions } from './HighlightHoverActions'

type HighlightViewProps = {
  item: ReadableItem
  viewer: UserBasicData
  highlight: Highlight
  author?: string
  title?: string
  updateHighlight: (highlight: Highlight) => void

  viewInReader: (highlightId: string) => void

  setLabelsTarget: (target: Highlight) => void
  setShowConfirmDeleteHighlightId: (set: string) => void
}

const StyledQuote = styled(Blockquote, {
  p: '0px',
  margin: '0px 0px 0px 0px',
  fontSize: '18px',
  lineHeight: '27px',
  borderRadius: '4px',
  width: '100%',
})

export function HighlightView(props: HighlightViewProps): JSX.Element {
  const isDark = isDarkTheme()
  const [noteMode, setNoteMode] = useState<'preview' | 'edit'>('preview')
  const [isHovered, setIsHovered] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [
      offset({
        mainAxis: -25,
      }),
      size(),
    ],
    placement: 'top-end',
    whileElementsMounted: autoUpdate,
  })

  const hover = useHover(context)

  const { getReferenceProps, getFloatingProps } = useInteractions([hover])

  const highlightAlpha = isDark ? 1.0 : 0.35

  return (
    <VStack
      ref={refs.setReference}
      {...getReferenceProps()}
      css={{
        p: '0px',
        width: '100%',
      }}
    >
      <Box
        ref={refs.setFloating}
        style={floatingStyles}
        {...getFloatingProps()}
      >
        <HighlightHoverActions
          viewer={props.viewer}
          highlight={props.highlight}
          isHovered={isOpen ?? false}
          viewInReader={props.viewInReader}
          setLabelsTarget={props.setLabelsTarget}
          setShowConfirmDeleteHighlightId={
            props.setShowConfirmDeleteHighlightId
          }
        />
      </Box>
      <VStack
        css={{
          width: '100%',

          '@mdDown': {
            padding: '0px',
          },
        }}
      >
        <StyledQuote>
          <SpanBox
            css={{
              '> *': {
                m: '0px',
                display: 'inline',
                padding: '2px',
                backgroundColor: `rgba(var(--colors-highlightBackground), ${highlightAlpha})`,
                boxShadow: `3px 0 0 rgba(var(--colors-highlightBackground), ${highlightAlpha}), -3px 0 0 rgba(var(--colors-highlightBackground), ${highlightAlpha})`,
                boxDecorationBreak: 'clone',
                borderRadius: '2px',
              },
              fontSize: '15px',
              lineHeight: 1.5,
              color: '$thTextSubtle2',
              img: {
                display: 'block',
                margin: '0.5em auto !important',
                maxWidth: '100% !important',
                height: 'auto',
              },
            }}
          >
            <ReactMarkdown
              children={props.highlight.quote ?? ''}
              remarkPlugins={[remarkGfm]}
            />
          </SpanBox>
        </StyledQuote>
        <Box css={{ display: 'block', pt: '5px' }}>
          {props.highlight.labels?.map(({ name, color }, index) => (
            <LabelChip key={index} text={name || ''} color={color} />
          ))}
        </Box>
        <HStack
          css={{
            width: '100%',
            pt: '15px',
            '@mdDown': {
              p: '10px',
            },
          }}
          alignment="start"
          distribution="start"
        >
          <HighlightViewNote
            targetId={props.highlight.id}
            text={props.highlight.annotation}
            placeHolder="Add notes to this highlight..."
            highlight={props.highlight}
            mode={noteMode}
            setEditMode={setNoteMode}
            updateHighlight={props.updateHighlight}
          />
        </HStack>
      </VStack>
    </VStack>
  )
}
