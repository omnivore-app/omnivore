import { Fragment, useMemo } from 'react'
import type { Highlight } from '../../lib/networking/fragments/highlightFragment'
import { Box, VStack, Blockquote, SpanBox } from '../elements/LayoutPrimitives'
import { StyledText } from '../elements/StyledText'
import { styled } from '../tokens/stitches.config'

type HighlightViewProps = {
  highlight: Highlight
  scrollToHighlight: (arg: string) => void;
  author?: string
  title?: string
}

export function HighlightView(props: HighlightViewProps): JSX.Element {
  const lines = useMemo(
    () => props.highlight.quote.split('\n'),
    [props.highlight.quote]
  )

  const StyledQuote = styled(Blockquote, {
    margin: '0px 0px 24px 0px',
    fontSize: '14px',
    lineHeight: '1.5',
    fontFamily: 'Inter',
    color: '$omnivoreGray',
    cursor: 'pointer',
  })

  const scrollToHighlight = () => props.scrollToHighlight(props.highlight.id)

  return (
    <VStack css={{ width: '100%', bg: '$omnivoreYellow', p: '20px' }}>
      <StyledQuote onClick={scrollToHighlight}>
        {props.highlight.prefix}
        <SpanBox css={{ bg: '$highlight', p: '1px', borderRadius: '2px' }}>
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
      <Box css={{}}>
        {props.author && (
          <StyledText style="highlightAuthor">{props.author}</StyledText>
        )}
        <StyledText style="highlightTitle">{props.title}</StyledText>
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
