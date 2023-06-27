import { useCallback } from 'react'
import { Highlight } from '../../../lib/networking/fragments/highlightFragment'
import { ReadableItem } from '../../../lib/networking/queries/useGetLibraryItemsQuery'
import {
  UserBasicData,
  useGetViewerQuery,
} from '../../../lib/networking/queries/useGetViewerQuery'
import { CloseButton } from '../../elements/CloseButton'
import { Dropdown, DropdownOption } from '../../elements/DropdownElements'
import { HStack } from '../../elements/LayoutPrimitives'
import { MenuTrigger } from '../../elements/MenuTrigger'
import { StyledText } from '../../elements/StyledText'
import { NotebookModal } from './NotebookModal'
import { Sidebar } from 'phosphor-react'
import { theme } from '../../tokens/stitches.config'
import { Button } from '../../elements/Button'

type NotebookHeaderProps = {
  setShowNotebook: (set: boolean) => void
}

export const NotebookHeader = (props: NotebookHeaderProps) => {
  const handleClose = useCallback(() => {
    props.setShowNotebook(false)
  }, [props])

  return (
    <HStack
      distribution="center"
      alignment="center"
      css={{
        width: '100%',
        position: 'sticky',
        top: '0px',
        height: '50px',
        p: '20px',
        borderTopLeftRadius: '10px',
        overflow: 'clip',
        background: '$thLibrarySearchbox',
        zIndex: 10,
        borderBottom: '1px solid $thNotebookBorder',
      }}
    >
      <StyledText style="modalHeadline" css={{ color: '$thNotebookSubtle' }}>
        Notebook
      </StyledText>
      <HStack
        css={{
          ml: 'auto',
          cursor: 'pointer',
          gap: '15px',
          mr: '-5px',
        }}
        distribution="center"
        alignment="center"
      >
        {/* <Dropdown triggerElement={<MenuTrigger />}>
          <DropdownOption
            onSelect={() => {
              // exportHighlights()
            }}
            title="Export Notebook"
          />
          <DropdownOption
            onSelect={() => {
              // setShowConfirmDeleteNote(true)
            }}
            title="Delete Article Note"
          />
        </Dropdown> */}
        <Button style="plainIcon" onClick={() => props.setShowNotebook(false)}>
          <Sidebar size={25} color={theme.colors.thNotebookSubtle.toString()} />
        </Button>
      </HStack>
    </HStack>
  )
}
