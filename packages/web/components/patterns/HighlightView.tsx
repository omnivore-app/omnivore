/* eslint-disable react/no-children-prop */
import { BookOpen, CaretDown, PencilLine } from 'phosphor-react'
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
import { isDarkTheme } from '../../lib/themeUpdater'
import { HighlightsMenu } from '../templates/homeFeed/HighlightItem'
import { ReadableItem } from '../../lib/networking/queries/useGetLibraryItemsQuery'
import { UserBasicData } from '../../lib/networking/queries/useGetViewerQuery'

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
  p: '10px',
  margin: '0px 0px 0px 0px',
  fontSize: '18px',
  lineHeight: '27px',
  borderRadius: '4px',
  width: '100%',
  background: 'rgba(255, 210, 52, 0.10)',
})

export function HighlightView(props: HighlightViewProps): JSX.Element {
  const isDark = isDarkTheme()
  const [noteMode, setNoteMode] = useState<'preview' | 'edit'>('preview')

  return (
    <VStack
      css={{
        p: '0px',
        width: '100%',
        alignItems: 'stretch',
        bg: isDark ? '#3D3D3D' : '$thBackground',
        borderRadius: '6px',
        border: '1px solid $thBorderSubtle',
        boxShadow: '0px 4px 4px rgba(33, 33, 33, 0.1)',
        '@mdDown': {
          p: '0px',
        },
      }}
    >
      <VStack
        css={{
          borderBottom: '1px solid $thBorderSubtle',
          width: '100%',
          height: '40px',
          paddingRight: '10px',
        }}
        distribution="end"
        alignment="end"
      >
        <HighlightsMenu
          item={props.item}
          viewer={props.viewer}
          highlight={props.highlight}
          viewInReader={props.viewInReader}
          setLabelsTarget={props.setLabelsTarget}
          setShowConfirmDeleteHighlightId={
            props.setShowConfirmDeleteHighlightId
          }
        />
      </VStack>
      {/* <VStack
        css={{
          minHeight: '100%',
          width: '10px',
          pt: '10px',
          pl: '10px',
          pr: '10px',
          '@mdDown': {
            display: 'none',
          },
        }}
      >
        <Box
          css={{
            width: '2px',
            flexGrow: '1',
            background: '#FFD234',
            marginTop: '5px',
            marginLeft: '5px',
            flex: '1',
            marginBottom: '25px',
          }}
        />
      </VStack> */}

      <VStack
        css={{
          width: '100%',
          padding: '10px',

          paddingTop: '15px',
          paddingRight: '15px',

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
