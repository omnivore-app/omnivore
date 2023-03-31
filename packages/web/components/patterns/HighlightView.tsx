import { BookOpen, PencilLine } from 'phosphor-react'
import { Fragment, useMemo, useState } from 'react'
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

type HighlightViewProps = {
  highlight: Highlight
  author?: string
  title?: string
  scrollToHighlight?: (arg: string) => void
  updateHighlight: (highlight: Highlight) => void
}

const StyledQuote = styled(Blockquote, {
  margin: '0px 0px 0px 0px',
  fontSize: '18px',
  lineHeight: '27px',
  color: '$grayText',
})

export function HighlightView(props: HighlightViewProps): JSX.Element {
  const [noteMode, setNoteMode] = useState<'preview' | 'edit'>('preview')

  const lines = useMemo(
    () => (props.highlight.quote || '').split('\n'),
    [props.highlight.quote]
  )

  return (
    <HStack
      css={{
        width: '100%',
        height: '100%',
        alignItems: 'stretch',
      }}
    >
      <VStack css={{ minHeight: '100%', width: '10px' }}>
        <Box
          css={{
            mt: '8px',
            width: '10px',
            height: '10px',
            background: '#FFD234',
            borderRadius: '7px',
          }}
        />
        <Box
          css={{
            width: '2px',
            flexGrow: '1',
            background: '#FFD234',
            marginLeft: '4px',
            flex: '1',
            marginBottom: '32px',
          }}
        />
      </VStack>
      <VStack css={{ width: '100%', padding: '0px', paddingLeft: '15px' }}>
        <StyledQuote
          onClick={() => {
            if (props.scrollToHighlight) {
              props.scrollToHighlight(props.highlight.id)
            }
          }}
        >
          <ReactMarkdown children={props.highlight.quote ?? ''} />
          {/* <SpanBox
            css={{
              p: '1px',
              borderRadius: '2px',
            }}
          >
            {lines.map((line: string, index: number) => (
              <Fragment key={index}>
                {line}
                {index !== lines.length - 1 && (
                  <>
                    <br />
                    <br />
                  </>
                )}
              </Fragment>
            ))}
          </SpanBox> */}
        </StyledQuote>
        <Box css={{ display: 'block', pt: '5px' }}>
          {props.highlight.labels?.map(({ name, color }, index) => (
            <LabelChip key={index} text={name || ''} color={color} />
          ))}
        </Box>
        <HStack
          css={{ width: '100%', height: '100%' }}
          alignment="start"
          distribution="start"
        >
          <HighlightViewNote
            text={props.highlight.annotation}
            placeHolder="Add notes to this highlight..."
            highlight={props.highlight}
            sizeMode={'normal'}
            mode={noteMode}
            setEditMode={setNoteMode}
            updateHighlight={props.updateHighlight}
          />
          <SpanBox
            css={{
              lineHeight: '1',
              marginLeft: '20px',
              marginTop: '20px',
              cursor: 'pointer',
              borderRadius: '1000px',
              '&:hover': {
                background: '#EBEBEB',
              },
            }}
            onClick={(event) => {
              setNoteMode(noteMode == 'preview' ? 'edit' : 'preview')
              event.preventDefault()
            }}
          >
            {noteMode === 'edit' ? (
              <BookOpen size={15} color="#898989" />
            ) : (
              <PencilLine size={15} color="#898989" />
            )}
          </SpanBox>
        </HStack>
      </VStack>
    </HStack>
  )
}
