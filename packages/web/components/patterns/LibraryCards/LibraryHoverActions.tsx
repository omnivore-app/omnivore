import { useState } from 'react'
import { Box, SpanBox } from '../../elements/LayoutPrimitives'
import { LibraryItemNode } from '../../../lib/networking/queries/useGetLibraryItemsQuery'
import { LinkedItemCardAction } from './CardTypes'
import { Button } from '../../elements/Button'
import { theme } from '../../tokens/stitches.config'
import { DotsThree, Share } from '@phosphor-icons/react'
import { CardMenu } from '../CardMenu'
import { UserBasicData } from '../../../lib/networking/queries/useGetViewerQuery'
import { ArchiveIcon } from '../../elements/icons/ArchiveIcon'
import { NotebookIcon } from '../../elements/icons/NotebookIcon'
import { TrashIcon } from '../../elements/icons/TrashIcon'
import { LabelIcon } from '../../elements/icons/LabelIcon'
import { UnarchiveIcon } from '../../elements/icons/UnarchiveIcon'
import { BrowserIcon } from '../../elements/icons/BrowserIcon'
import useLibraryItemActions from '../../../lib/hooks/useLibraryItemActions'
import { MoveToInboxIcon } from '../../elements/icons/MoveToInboxIcon'

type LibraryHoverActionsProps = {
  viewer: UserBasicData

  isHovered: boolean

  item: LibraryItemNode
  handleAction: (action: LinkedItemCardAction) => void
}

export const LibraryHoverActions = (props: LibraryHoverActionsProps) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const { moveItem } = useLibraryItemActions()

  return (
    <Box
      css={{
        overflow: 'clip',

        height: '33px',
        width: '200px',
        bg: '$thBackground',
        display: 'flex',

        pt: '0px',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid $thBackground5',
        borderRadius: '5px',

        gap: '5px',
        px: '5px',
        visibility: props.isHovered || menuOpen ? 'visible' : 'hidden',
        '&:hover': {
          boxShadow:
            '0 1px 3px 0 rgba(0, 0, 0, 0.1),0 1px 2px 0 rgba(0, 0, 0, 0.06);',
        },
      }}
      onClick={(event) => {
        event.stopPropagation()
      }}
    >
      <Button
        title="View notebook (t)"
        style="hoverActionIcon"
        onClick={(event) => {
          props.handleAction('open-notebook')
          event.preventDefault()
          event.stopPropagation()
        }}
        css={{
          visibility: props.isHovered || menuOpen ? 'visible' : 'hidden',
        }}
      >
        <NotebookIcon
          size={21}
          color={theme.colors.thNotebookSubtle.toString()}
        />
      </Button>
      {props.item.folder == 'following' ? (
        <Button
          title="Move to library"
          style="hoverActionIcon"
          onClick={async (event) => {
            event.preventDefault()
            event.stopPropagation()
            props.handleAction('move-to-inbox')
          }}
        >
          <MoveToInboxIcon
            size={21}
            color={theme.colors.thNotebookSubtle.toString()}
          />
        </Button>
      ) : (
        <Button
          title={props.item.isArchived ? 'Unarchive (e)' : 'Archive (e)'}
          style="hoverActionIcon"
          onClick={(event) => {
            const action = props.item.isArchived ? 'unarchive' : 'archive'
            props.handleAction(action)
            event.preventDefault()
            event.stopPropagation()
          }}
        >
          {props.item.isArchived ? (
            <UnarchiveIcon
              size={21}
              color={theme.colors.thNotebookSubtle.toString()}
            />
          ) : (
            <ArchiveIcon
              size={21}
              color={theme.colors.thNotebookSubtle.toString()}
            />
          )}
        </Button>
      )}
      <Button
        title="Remove (#)"
        style="hoverActionIcon"
        onClick={(event) => {
          props.handleAction('delete')
          event.preventDefault()
          event.stopPropagation()
        }}
      >
        <TrashIcon size={21} color={theme.colors.thNotebookSubtle.toString()} />
      </Button>
      <Button
        title="Edit labels (l)"
        style="hoverActionIcon"
        onClick={(event) => {
          props.handleAction('set-labels')
          event.preventDefault()
          event.stopPropagation()
        }}
      >
        <LabelIcon size={21} color={theme.colors.thNotebookSubtle.toString()} />
      </Button>
      <Button
        title="Open original (o)"
        style="hoverActionIcon"
        onClick={(event) => {
          props.handleAction('showOriginal')
          event.preventDefault()
          event.stopPropagation()
        }}
      >
        <BrowserIcon
          size={21}
          color={theme.colors.thNotebookSubtle.toString()}
        />
      </Button>
      <CardMenu
        item={props.item}
        viewer={props.viewer}
        onOpenChange={(open) => setMenuOpen(open)}
        actionHandler={props.handleAction}
        triggerElement={
          <SpanBox
            css={{
              display: 'flex',
              pt: '2.5px',
              height: '33px',
              '&:hover': {
                bg: '$grayBgHover',
              },
            }}
          >
            <DotsThree
              size={25}
              weight="bold"
              color={theme.colors.thNotebookSubtle.toString()}
            />
          </SpanBox>
        }
      />
    </Box>
  )
}
