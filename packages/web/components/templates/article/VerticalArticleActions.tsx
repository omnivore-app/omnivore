import { ArticleAttributes } from '../../../lib/networking/library_items/useLibraryItems'
import { Button } from '../../elements/Button'
import { HStack } from '../../elements/LayoutPrimitives'
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
import { State } from '../../../lib/networking/fragments/articleFragment'

export type ArticleActionsMenuLayout = 'top' | 'side'

type ArticleActionsMenuProps = {
  article?: ArticleAttributes
  layout: ArticleActionsMenuLayout
  showReaderDisplaySettings?: boolean
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
          gap: '30px',
        }}
      >
        <Button
          title="Open notebook (t)"
          style="articleActionIcon"
          onClick={() => props.articleActionHandler('showHighlights')}
          css={{
            display: 'none',
            alignItems: 'center',
            '@media (min-width: 500px)': {
              display: 'flex',
            },
          }}
        >
          <NotebookIcon
            size={24}
            color={theme.colors.thHighContrast.toString()}
          />
        </Button>

        <Button
          title="Edit info (i)"
          style="articleActionIcon"
          onClick={() => props.articleActionHandler('showEditModal')}
          css={{
            display: 'none',
            alignItems: 'center',
            '@media (min-width: 420px)': {
              display: 'flex',
            },
          }}
        >
          <EditInfoIcon
            size={24}
            color={theme.colors.thHighContrast.toString()}
          />
        </Button>

        <Button
          title="Edit labels (l)"
          style="articleActionIcon"
          onClick={() => props.articleActionHandler('setLabels')}
          css={{
            display: 'none',
            alignItems: 'center',
            '@media (min-width: 400px)': {
              display: 'flex',
            },
          }}
        >
          <LabelIcon size={24} color={theme.colors.thHighContrast.toString()} />
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
          }}
        >
          <TrashIcon size={24} color={theme.colors.thHighContrast.toString()} />
        </Button>

        {props.article?.state !== State.ARCHIVED ? (
          <Button
            title="Archive (e)"
            style="articleActionIcon"
            onClick={() => props.articleActionHandler('archive')}
            css={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <ArchiveIcon
              size={24}
              color={theme.colors.thHighContrast.toString()}
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
            }}
          >
            <UnarchiveIcon
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
          libraryItem={props.article}
          triggerElement={
            <CircleUtilityMenuIcon
              size={24}
              color={theme.colors.thHighContrast.toString()}
            />
          }
          articleActionHandler={props.articleActionHandler}
        />
      </HStack>
    </>
  )
}
