import { Fragment, useMemo, useState } from 'react'
import type { Highlight } from '../../lib/networking/fragments/highlightFragment'
import { HighlightNoteTextEditArea } from '../elements/HighlightNoteTextEditArea'
import { LabelChip } from '../elements/LabelChip'
import {
  Box,
  VStack,
  Blockquote,
  SpanBox,
  HStack,
} from '../elements/LayoutPrimitives'
import { StyledText } from '../elements/StyledText'
import { styled, theme } from '../tokens/stitches.config'

type HighlightViewProps = {
  highlight: Highlight
  author?: string
  title?: string
  scrollToHighlight?: (arg: string) => void
}

const StyledQuote = styled(Blockquote, {
  margin: '0px 0px 0px 0px',
  fontSize: '18px',
  lineHeight: '27px',
  color: '$grayText',
})

export function HighlightView(props: HighlightViewProps): JSX.Element {
  const [isEditing, setIsEditing] = useState(false)

  const lines = useMemo(
    () => props.highlight.quote.split('\n'),
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
            mt: '5px',
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
      <VStack css={{ width: '100%', padding: '0px 15px' }}>
        <StyledQuote
          onClick={() => {
            if (props.scrollToHighlight) {
              props.scrollToHighlight(props.highlight.id)
            }
          }}
        >
          <SpanBox css={{ p: '1px', borderRadius: '2px' }}>
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
          </SpanBox>
        </StyledQuote>
        <Box css={{ display: 'block', pt: '5px' }}>
          {props.highlight.labels?.map(({ name, color }, index) => (
            <LabelChip key={index} text={name || ''} color={color} />
          ))}
        </Box>
        {!isEditing ? (
          <StyledText
            css={{
              borderRadius: '5px',
              p: '10px',
              width: '100%',
              marginTop: '15px',
              color: '$thHighContrast',
              border: '1px solid #EBEBEB',
            }}
            onClick={() => setIsEditing(true)}
          >
            {props.highlight.annotation
              ? props.highlight.annotation
              : 'Add notes to this highlight...'}
          </StyledText>
        ) : null}
        {isEditing && (
          <HighlightNoteTextEditArea
            setIsEditing={setIsEditing}
            highlight={props.highlight}
            updateHighlight={() => {} /* props.updateHighlight */}
          />
        )}
      </VStack>
    </HStack>
  )
}
