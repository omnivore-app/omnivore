import { Tray } from 'phosphor-react'
import { ArticleAttributes } from '../../../lib/networking/queries/useGetArticleQuery'
import { Button } from '../../elements/Button'
import { HStack } from '../../elements/LayoutPrimitives'
import { TooltipWrapped } from '../../elements/Tooltip'
import { theme } from '../../tokens/stitches.config'
import { ReaderDropdownMenu } from '../../patterns/ReaderDropdownMenu'
import { ArchiveIcon } from '../../elements/icons/ArchiveIcon'
import { NotebookIcon } from '../../elements/icons/NotebookIcon'
import { TrashIcon } from '../../elements/icons/TrashIcon'
import { LabelIcon } from '../../elements/icons/LabelIcon'
import { EditInfoIcon } from '../../elements/icons/EditInfoIcon'
import { ReaderSettingsIcon } from '../../elements/icons/ReaderSettingsIcon'
import { CircleUtilityMenuIcon } from '../../elements/icons/CircleUtilityMenuIcon'
import { UnarchiveIcon } from '../../elements/icons/UnarchiveIcon'
import { LeftPanelToggleIcon } from '../../elements/icons/LeftPanelToggleIcon'
import { InspectorView } from '../Inspector'

export type ArticleActionsMenuLayout = 'top' | 'side'

type ArticleActionsMenuProps = {
  article?: ArticleAttributes
  layout: ArticleActionsMenuLayout
  showReaderDisplaySettings?: boolean
  showInspectorToggle?: boolean
  openInspector: (initial: InspectorView | undefined) => void
  articleActionHandler: (action: string, arg?: unknown) => void
}

export function VerticalArticleActionsMenu(
  props: ArticleActionsMenuProps
): JSX.Element {
  return (
    <>
      <HStack
        distribution="end"
        alignment="center"
        css={{
          width: '100%',
          gap: '5px',
        }}
      >
        <Button
          title="Edit labels (l)"
          style="articleActionIcon"
          onClick={() => props.articleActionHandler('setLabels')}
          css={{
            display: 'flex',
            alignItems: 'center',
            '@media (max-width: 300px)': {
              display: 'none',
            },
          }}
        >
          <LabelIcon
            size={25}
            color={theme.colors.thNotebookSubtle.toString()}
          />
        </Button>

        <Button
          title="Open notebook (t)"
          style="articleActionIcon"
          onClick={() => props.articleActionHandler('showNotebook')}
          css={{
            display: 'flex',
            alignItems: 'center',
            '@media (max-width: 300px)': {
              display: 'none',
            },
          }}
        >
          <NotebookIcon
            size={25}
            color={theme.colors.thNotebookSubtle.toString()}
          />
        </Button>

        <Button
          title="Edit info (i)"
          style="articleActionIcon"
          onClick={() => props.articleActionHandler('showEditModal')}
          css={{
            display: 'flex',
            alignItems: 'center',
            '@mdDown': {
              display: 'none',
            },
          }}
        >
          <EditInfoIcon
            size={25}
            color={theme.colors.thNotebookSubtle.toString()}
          />
        </Button>

        <Button
          title="Remove (#)"
          style="articleActionIcon"
          onClick={() => {
            props.articleActionHandler('delete')
          }}
          css={{
            display: 'flex',
            alignItems: 'center',
            '@mdDown': {
              display: 'none',
            },
          }}
        >
          <TrashIcon
            size={25}
            color={theme.colors.thNotebookSubtle.toString()}
          />
        </Button>

        {!props.article?.isArchived ? (
          <Button
            title="Archive (e)"
            style="articleActionIcon"
            onClick={() => props.articleActionHandler('archive')}
            css={{
              display: 'flex',
              alignItems: 'center',
              '@media (max-width: 300px)': {
                display: 'none',
              },
            }}
          >
            <ArchiveIcon
              size={25}
              color={theme.colors.thNotebookSubtle.toString()}
            />
          </Button>
        ) : (
          <Button
            title="Unarchive (e)"
            style="articleActionIcon"
            onClick={() => props.articleActionHandler('unarchive')}
            css={{
              display: 'flex',
              alignItems: 'center',
              '@media (max-width: 300px)': {
                display: 'none',
              },
            }}
          >
            <UnarchiveIcon
              size={25}
              color={theme.colors.thNotebookSubtle.toString()}
            />
          </Button>
        )}
        {props.showReaderDisplaySettings && (
          <Button
            title="Display Settings (d)"
            style="articleActionIcon"
            onClick={() => props.articleActionHandler('editDisplaySettings')}
            css={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <ReaderSettingsIcon
              size={24}
              color={theme.colors.thHighContrast.toString()}
            />
          </Button>
        )}
        <Button
          title="Display settings (d)"
          style="articleActionIcon"
          onClick={() => props.articleActionHandler('editDisplaySettings')}
          css={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <ReaderSettingsIcon
            size={24}
            color={theme.colors.thHighContrast.toString()}
          />
        </Button>

        <ReaderDropdownMenu
          triggerElement={
            <CircleUtilityMenuIcon
              size={25}
              color={theme.colors.thNotebookSubtle.toString()}
            />
          }
          articleActionHandler={props.articleActionHandler}
        />

        {props.showInspectorToggle && (
          <Button
            title="Toggle Inspector"
            style="articleActionIcon"
            onClick={(event) => {
              props.openInspector(undefined)
              event.preventDefault()
            }}
            css={{ ml: '30px' }}
          >
            <LeftPanelToggleIcon
              size={25}
              color={theme.colors.thNotebookSubtle.toString()}
            />
          </Button>
        )}
      </HStack>
    </>
  )
}
