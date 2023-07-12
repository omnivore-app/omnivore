import Link from 'next/link'
import { Book } from 'phosphor-react'
import { Button } from '../../elements/Button'
import { VStack } from '../../elements/LayoutPrimitives'
import { StyledText } from '../../elements/StyledText'
import { theme } from '../../tokens/stitches.config'

type EmptyLibraryProps = {
  onAddLinkClicked: () => void
}

export function EmptyLibrary(props: EmptyLibraryProps): JSX.Element {
  return (
    <VStack
      alignment="center"
      distribution="center"
      css={{
        color: '$grayTextContrast',
        textAlign: 'center',
        paddingTop: '88px',
        flex: '1',
      }}
    >
      <Book size={44} color={theme.colors.grayTextContrast.toString()} />
      <StyledText style="fixedHeadline" css={{ color: '$grayTextContrast' }}>
        No results found.
      </StyledText>

      <StyledText style="footnote" css={{ color: '$grayTextContrast' }}>
        You can add a link or read more about Omnivore&apos;s{' '}
        <a href="https://docs.omnivore.app/using/search.html" target="_blank">
          advanced search
        </a>
        .
      </StyledText>

      <Button
        style="ctaDarkYellow"
        onClick={() => {
          props.onAddLinkClicked()
        }}
      >
        Add Link
      </Button>
    </VStack>
  )
}
