import { Fragment, useMemo } from 'react'
import type { Highlight } from '../../lib/networking/fragments/highlightFragment'
import { LabelChip } from '../elements/LabelChip'
import { Box, VStack, Blockquote, SpanBox } from '../elements/LayoutPrimitives'
import { StyledText } from '../elements/StyledText'
import { styled } from '../tokens/stitches.config'

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
  padding: '0px 16px',
  borderLeft: '2px solid $omnivoreCtaYellow',
})

export function HighlightView(props: HighlightViewProps): JSX.Element {
  const lines = useMemo(
    () => props.highlight.quote.split('\n'),
    [props.highlight.quote]
  )

  return (
    <VStack css={{ width: '100%', boxSizing: 'border-box' }}>
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
      <Box css={{ display: 'block', pt: '16px' }}>
        {props.highlight.labels?.map(({ name, color }, index) => (
          <LabelChip key={index} text={name || ''} color={color} />
        ))}
      </Box>
    </VStack>
  )
}
