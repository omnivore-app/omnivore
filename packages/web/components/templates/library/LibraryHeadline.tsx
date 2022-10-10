import { HStack, SpanBox } from '../../elements/LayoutPrimitives'
import { useGetUserPreferences } from '../../../lib/networking/queries/useGetUserPreferences'
import { StyledText } from '../../elements/StyledText'
import { theme } from '../../tokens/stitches.config'
import { LibraryListLayoutIcon } from '../../elements/images/LibraryListLayoutIcon'
import { LibraryGridLayoutIcon } from '../../elements/images/LibraryGridLayoutIcon'
import { Button } from '../../elements/Button'
import { LayoutCoordinator, LibraryLayoutType } from './LibraryContainer'
import { useCallback } from 'react'
import { Plus } from 'phosphor-react'

export type LibraryHeadlineProps = {
  layoutCoordinator: LayoutCoordinator
}

export function LibraryHeadline(props: LibraryHeadlineProps): JSX.Element {
  const typeColor = useCallback(
    (type: LibraryLayoutType) => {
      return props.layoutCoordinator.layout === type
        ? theme.colors.omnivoreCtaYellow.toString()
        : '#D6D6D6'
    },
    [props.layoutCoordinator.layout]
  )

  return (
    <HStack
      alignment="center"
      distribution="start"
      css={{ pt: '8px', pb: '14px', width: '100%', pr: '15px' }}
    >
      <StyledText style="libraryHeader">Home</StyledText>
      <HStack
        alignment="center"
        distribution="start"
        css={{ marginLeft: 'auto', gap: '8px' }}
      >
        <Button
          style="ctaDarkYellow"
          css={{
            py: '10px',
            px: '14px',
            mr: '16px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Plus size={16} weight="bold" />
          <SpanBox css={{ pl: '10px', fontWeight: '600', fontSize: '16px' }}>
            Add Link
          </SpanBox>
        </Button>
        <Button
          style="ghost"
          onClick={() => props.layoutCoordinator.setLayout('LIST_LAYOUT')}
          css={{ display: 'flex', alignItems: 'center' }}
        >
          <LibraryListLayoutIcon color={typeColor('LIST_LAYOUT')} />
        </Button>
        <Button
          style="ghost"
          onClick={() => props.layoutCoordinator.setLayout('GRID_LAYOUT')}
          css={{ display: 'flex', alignItems: 'center' }}
        >
          <LibraryGridLayoutIcon color={typeColor('GRID_LAYOUT')} />
        </Button>
      </HStack>
    </HStack>
  )
}
