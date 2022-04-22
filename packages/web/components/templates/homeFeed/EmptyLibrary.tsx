

// There aren't any discussions.
// You can open a new discussion to ask questions about this repository or get help.

import Link from 'next/link'
import { Book } from 'phosphor-react'
import { LibraryItem } from '../../../lib/networking/queries/useGetLibraryItemsQuery'
import { Button } from '../../elements/Button'
import { Box, VStack } from '../../elements/LayoutPrimitives'
import { StyledText } from '../../elements/StyledText'
import { LinkedItemCardAction } from '../../patterns/LibraryCards/CardTypes'
import { theme } from '../../tokens/stitches.config'

type EmptyLibraryProps = {
  onAddLinkClicked: () => void
}

export function EmptyLibrary(props: EmptyLibraryProps): JSX.Element {
  return (
    <VStack alignment="center" distribution="center" css={{ color: '$grayTextContrast', textAlign: 'center', paddingTop: '88px' }}>
      <Book size={44} color={theme.colors.grayTextContrast.toString()} />
        <StyledText style="fixedHeadline" css={{ color: '$grayTextContrast' }}>
          No results found.
        </StyledText>

        <StyledText style="footnote" css={{ color: '$grayTextContrast' }}>
          You can add a link or read more about Omnivore&apos;s <Link href="/help/search">advanced search</Link>.
        </StyledText>
        
        <Button style="ctaDarkYellow" onClick={() => { props.onAddLinkClicked() }}>
          Add Link
        </Button>
    </VStack>
  )
}
