import { Book } from 'phosphor-react'
import { VStack } from '../../elements/LayoutPrimitives'
import { StyledText } from '../../elements/StyledText'
import { theme } from '../../tokens/stitches.config'
import { HEADER_HEIGHT } from './HeaderSpacer'

export function EmptyHighlights(): JSX.Element {
  return (
    <VStack
      alignment="center"
      distribution="center"
      css={{
        color: '$grayTextContrast',
        textAlign: 'center',
        marginTop: HEADER_HEIGHT,
      }}
    >
      <Book size={44} color={theme.colors.grayTextContrast.toString()} />
      <StyledText style="fixedHeadline" css={{ color: '$grayTextContrast' }}>
        No results found.
      </StyledText>
    </VStack>
  )
}
