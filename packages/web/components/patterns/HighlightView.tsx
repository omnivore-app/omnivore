/* eslint-disable react/no-children-prop */
import { useState } from 'react'
import type { Highlight } from '../../lib/networking/fragments/highlightFragment'
import { LabelChip } from '../elements/LabelChip'
import {
  Box,
  VStack,
  Blockquote,
  SpanBox,
  HStack,
} from '../elements/LayoutPrimitives'
import { styled } from '../tokens/stitches.config'
import { HighlightViewNote } from './HighlightNotes'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { highlightColorVar } from '../../lib/themeUpdater'
import { ReadableItem } from '../../lib/networking/library_items/useLibraryItems'
import { UserBasicData } from '../../lib/networking/queries/useGetViewerQuery'
import {
  autoUpdate,
  offset,
  size,
  useFloating,
  useHover,
  useInteractions,
} from '@floating-ui/react'
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
  const [noteMode, setNoteMode] = useState<'preview' | 'edit'>('preview')
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
  const highlightColor = highlightColorVar(props.highlight.color)

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
                display: 'inline',
                padding: '3px',
                backgroundColor: `rgba(${highlightColor}, var(--colors-highlight_background_alpha))`,
                boxDecorationBreak: 'clone',
                borderRadius: '2px',
              },
              '> ul': {
                display: 'block',
                boxShadow: 'unset',
                backgroundColor: 'unset',
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
