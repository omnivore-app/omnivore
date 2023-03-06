import { styled } from '@stitches/react'
import { Fragment, useMemo } from 'react'
import { LabelChip } from '../../elements/LabelChip'
import {
  VStack,
  HStack,
  Blockquote,
  SpanBox,
  Box,
} from '../../elements/LayoutPrimitives'
import { StyledMark, StyledText } from '../../elements/StyledText'
import { HighlightView } from '../HighlightView'
import { LinkedItemCardAction, LinkedItemCardProps } from './CardTypes'
import { TitleStyle } from './LibraryCardStyles'

export interface HighlightItemCardProps
  extends Pick<LinkedItemCardProps, 'item'> {
  handleAction: (action: LinkedItemCardAction) => void
}

export const PreviewImage = styled('img', {
  objectFit: 'cover',
  cursor: 'pointer',
})

const StyledQuote = styled(Blockquote, {
  margin: '0px 0px 0px 0px',
  fontSize: '16px',
  lineHeight: '27px',
  color: '$grayText',
  paddingLeft: '20px',
  // borderRadius: '8px',
  borderLeft: '2px solid $omnivoreCtaYellow',
})

export function HighlightItemCard(props: HighlightItemCardProps): JSX.Element {
  const lines = useMemo(() => props.item.quote.split('\n'), [props.item.quote])
  return (
    <VStack
      css={{
        p: '20px',
        gap: '20px',
        height: '100%',
        width: '320px',
        borderRadius: '8px',
        cursor: 'pointer',
        wordBreak: 'break-word',
        overflow: 'clip',
        border: '1px solid $thBorderColor',
        borderBottom: 'none',
        boxShadow: '0px 3px 11px rgba(32, 31, 29, 0.04)',
        bg: '$grayBg',
        '&:focus': {
          bg: '$grayBgActive',
        },
        '&:hover': {
          bg: '$grayBgActive',
        },
      }}
      alignment="start"
      distribution="start"
      onClick={() => {
        props.handleAction('showDetail')
      }}
    >
      <Box
        css={{
          ...TitleStyle,
          height: '42px',
        }}
      >
        {props.item.title}
      </Box>
      <StyledQuote>
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
        <Box css={{ display: 'block', pt: '16px' }}>
          {props.item.labels?.map(({ name, color }, index) => (
            <LabelChip key={index} text={name || ''} color={color} />
          ))}
        </Box>
      </StyledQuote>
    </VStack>
  )
}
