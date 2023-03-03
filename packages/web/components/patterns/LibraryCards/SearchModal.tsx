import { ReactNode, useMemo, useRef, useState } from 'react'
import { StyledText } from '../../elements/StyledText'
import { Box, HStack, SpanBox, VStack } from '../../elements/LayoutPrimitives'
import { Dropdown, DropdownOption } from '../../elements/DropdownElements'
import { Button, IconButton } from '../../elements/Button'
import {
  CaretRight,
  Circle,
  DotsThree,
  MagnifyingGlass,
  Plus,
  X,
} from 'phosphor-react'
import { useGetSubscriptionsQuery } from '../../../lib/networking/queries/useGetSubscriptionsQuery'
import { useGetLabelsQuery } from '../../../lib/networking/queries/useGetLabelsQuery'
import { Label } from '../../../lib/networking/fragments/labelFragment'
import {
  ModalContent,
  ModalOverlay,
  ModalRoot,
} from '../../elements/ModalPrimitives'
import { theme } from '../../tokens/stitches.config'
import { FormInput } from '../../elements/FormElements'
import { SearchBox } from '../../templates/homeFeed/LibraryHeader'

type SearchModalProps = {
  searchTerm: string | undefined
  applySearchQuery: (searchTerm: string) => void

  onOpenChange: (open: boolean) => void
}

export function SearchModal(props: SearchModalProps): JSX.Element {
  return (
    <ModalRoot defaultOpen onOpenChange={props.onOpenChange} css={{}}>
      <ModalOverlay onClick={(e) => e.preventDefault()} />
      <ModalContent
        css={{
          bg: '$grayBg',
          width: '100%',
          p: '10px',
          height: '120px',
          top: '70px',
        }}
        onInteractOutside={() => {
          // remove focus from modal
          ;(document.activeElement as HTMLElement).blur()
        }}
      >
        <VStack distribution="start" css={{ p: '0px' }}>
          <Box css={{ width: '100%' }}>
            <SearchBox
              {...props}
              compact={true}
              onClose={() => props.onOpenChange(false)}
            />
          </Box>
        </VStack>
      </ModalContent>
    </ModalRoot>
  )
}
