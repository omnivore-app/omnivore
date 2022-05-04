import { Fragment, useMemo } from 'react'
import type { Highlight } from '../../lib/networking/fragments/highlightFragment'
import { Box, VStack, Blockquote, SpanBox } from '../elements/LayoutPrimitives'
import { StyledText } from '../elements/StyledText'
import { styled } from '../tokens/stitches.config'

type HighlightViewProps = {
  highlight: Highlight
  author?: string
  title?: string
  scrollToHighlight?: (arg: string) => void;
}

export function HighlightView(props: HighlightViewProps): JSX.Element {
  const lines = useMemo(
    () => props.highlight.quote.split('\n'),
    [props.highlight.quote]
  )
  const annotation = props.highlight.annotation ?? '';

  const StyledQuote = styled(Blockquote, {
    margin: '0px 24px 16px 24px',
    fontSize: '18px',
    lineHeight: '27px',
    color: '$textDefault',
    cursor: 'pointer',
  })

  return (
    <VStack css={{ width: '100%', boxSizing: 'border-box' }}>
      {annotation && (
        <Box css={{p:'16px', m:'16px', ml:'24px', mr:'24px', borderRadius: '6px', bg: '$grayBase'}}>
          <StyledText style='shareHighlightModalAnnotation'>{annotation}</StyledText>
        </Box>)
      }
      <StyledQuote onClick={() => {
        if (props.scrollToHighlight) {
          props.scrollToHighlight(props.highlight.id)
        }
      }}>
        {props.highlight.prefix}
        <SpanBox css={{ bg: '$highlightBackground', p: '1px', borderRadius: '2px', }}>
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
        {props.highlight.suffix}
      </StyledQuote>
      <Box css={{p: '24px', pt: '0', width: '100%', boxSizing: 'border-box'}}>
        {props.author && props.title &&(
          <StyledText style="highlightTitleAndAuthor">{props.title + props.author}</StyledText>
        )}
      </Box>
    </VStack>
  )
}

export function PublicHighlightView(props: HighlightViewProps): JSX.Element {
  const lines = useMemo(
    () => props.highlight.quote.split('\n'),
    [props.highlight.quote]
  )

  const StyledQuote = styled(Blockquote, {
    margin: '16px 0px 0px 0px',
    fontSize: '18px',
    lineHeight: '1.5',
    fontFamily: 'Inter',
    color: '$readerFont',
  })

  return (
    <VStack css={{ width: '100%', bg: '$grayBackground', pt: '0px' }}>
      <StyledQuote>
        {props.highlight.prefix}
        <SpanBox
          css={{
            bg: '$omnivoreYellow',
            p: '1px',
            borderRadius: '2px',
            color: '#3d3d3d',
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
        </SpanBox>
        {props.highlight.suffix}
      </StyledQuote>
    </VStack>
  )
}

type HighlightFooterProps = {
  site: string
  author?: string
  title?: string
  fontSize?: string
}

export function HighlightFooter(props: HighlightFooterProps): JSX.Element {
  const fontSize = props.fontSize || '12px'

  return (
    <VStack
      alignment="start"
      css={{ width: '100%', bg: '$grayBackground', pt: '0px', pb: '8px' }}
    >
      <StyledText
        css={{
          fontSize: fontSize,
          fontFamily: 'Inter',
          color: '$omnivoreGray',
          fontWeight: '400',
          mb: '0px',
          p: '0px',
        }}
      >
        From{' '}
        <SpanBox
          css={{
            fontSize: fontSize,
            color: '$omnivoreOrange',
            p: '0px',
            fontWeight: '400',
            mb: '0px',
          }}
        >
          {props.title}
          {props.author ? ` — ${props.author}` : null}
        </SpanBox>
      </StyledText>
      <StyledText
        css={{
          pt: '0px',
          mt: '0px',
          fontSize: '10px',
          fontFamily: 'Inter',
          color: '$omnivoreGray',
          fontWeight: '400',
        }}
      >
        {props.site}
      </StyledText>
    </VStack>
  )
}
