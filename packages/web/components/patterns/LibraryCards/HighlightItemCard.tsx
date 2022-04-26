import { styled } from '../../tokens/stitches.config'
import HighlightImage from "../../elements/images/HighlightImage"
import { VStack, HStack } from "../../elements/LayoutPrimitives"
import { StyledText } from "../../elements/StyledText"
import { LinkedItemCardProps } from "./CardTypes"

export const StyledMark = styled('mark', {
  
})

export function HighlightItemCard(props: LinkedItemCardProps): JSX.Element {
  return(
    <VStack
      css={{
        p: '$2',
        maxWidth: '498px',
        borderRadius: '6px',
        cursor: 'pointer',
        wordBreak: 'break-word',
        overflow: 'clip',
        border: '1px solid $grayBorder',
        boxShadow: '0px 3px 11px rgba(32, 31, 29, 0.04)',
      }}
      alignment="start"
      distribution="start"
      onClick={() => {
        props.handleAction('showDetail')
      }}
    >
      <StyledText css={{
        lineHeight: '20px'
      }}>
        <StyledMark css={{
          background: '$highlightBackground',
          color: '$highlightText',
        }}>
          {props.item.description}
        </StyledMark>
      </StyledText>
      <HStack
        css={{
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <HighlightImage />
        <StyledText
          css={{
            marginLeft: '$2',
            fontWeight: '700',
          }}
        >{props.item.title.substring(0,50).concat(props.item.title.length > 50 ? '...' : '')}</StyledText>
      </HStack>
    </VStack>
  )
}
