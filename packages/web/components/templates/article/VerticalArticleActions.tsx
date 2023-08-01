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
          <LabelIcon size={24} color={theme.colors.thHighContrast.toString()} />
        </Button>

        <Button
          style="articleActionIcon"
          onClick={() => props.articleActionHandler('showHighlights')}
          css={{
            display: 'flex',
            alignItems: 'center',
            '@media (max-width: 300px)': {
              display: 'none',
            },
          }}
        >
          <TooltipWrapped
            tooltipContent="Open Notebook (t)"
            tooltipSide={props.layout == 'side' ? 'right' : 'bottom'}
          >
            <NotebookIcon
              size={24}
              color={theme.colors.thHighContrast.toString()}
            />
          </TooltipWrapped>
        </Button>

        <Button
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
          <TooltipWrapped
            tooltipContent="Edit Info (i)"
            tooltipSide={props.layout == 'side' ? 'right' : 'bottom'}
          >
            <EditInfoIcon
              size={24}
              color={theme.colors.thHighContrast.toString()}
            />
          </TooltipWrapped>
        </Button>

        <Button
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
          <TooltipWrapped
            tooltipContent="Remove (#)"
            tooltipSide={props.layout == 'side' ? 'right' : 'bottom'}
          >
            <TrashIcon
              size={24}
              color={theme.colors.thHighContrast.toString()}
            />
          </TooltipWrapped>
        </Button>

        {!props.article?.isArchived ? (
          <Button
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
            <TooltipWrapped
              tooltipContent="Archive (e)"
              tooltipSide={props.layout == 'side' ? 'right' : 'bottom'}
            >
              <ArchiveIcon
                size={24}
                color={theme.colors.thHighContrast.toString()}
              />
            </TooltipWrapped>
          </Button>
        ) : (
          <Button
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
            <TooltipWrapped
              tooltipContent="Unarchive (e)"
              tooltipSide={props.layout == 'side' ? 'right' : 'bottom'}
            >
              <UnarchiveIcon
                size={24}
                color={theme.colors.thHighContrast.toString()}
              />
            </TooltipWrapped>
          </Button>
        )}
        <Button
          style="articleActionIcon"
          onClick={() => props.articleActionHandler('editDisplaySettings')}
          css={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <TooltipWrapped
            tooltipContent="Edit Info (i)"
            tooltipSide={props.layout == 'side' ? 'right' : 'bottom'}
          >
            <ReaderSettingsIcon
              size={24}
              color={theme.colors.thHighContrast.toString()}
            />
          </TooltipWrapped>
        </Button>

        <ReaderDropdownMenu
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
