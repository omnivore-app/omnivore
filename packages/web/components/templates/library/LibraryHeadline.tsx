import { HStack } from '../../elements/LayoutPrimitives'
import { useGetUserPreferences } from '../../../lib/networking/queries/useGetUserPreferences'
import { StyledText } from '../../elements/StyledText'
import { theme } from '../../tokens/stitches.config'
import { LibraryListLayoutIcon } from '../../elements/images/LibraryListLayoutIcon'
import { LibraryGridLayoutIcon } from '../../elements/images/LibraryGridLayoutIcon'
import { Button } from '../../elements/Button'


export function LibraryHeadline(): JSX.Element {
  useGetUserPreferences()

  return (
    <HStack alignment="center" distribution="start" css={{ pt: '4px', pb: '8px', width: '100%', pr: '15px' }}>
      <StyledText style="libraryHeader">Home</StyledText>
      <HStack alignment="center" distribution="start" css={{ marginLeft: 'auto', gap: '16px' }}>
        <Button style="ctaDarkYellow">Add Link</Button>
        <Button style="ghost">
          <LibraryListLayoutIcon color="#D6D6D6" />
        </Button>
        <Button style="ghost">
          <LibraryGridLayoutIcon color={theme.colors.omnivoreCtaYellow.toString()} />
        </Button>
      </HStack>
    </HStack>
  )
}