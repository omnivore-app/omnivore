import { Separator } from '@radix-ui/react-separator'
import { ArticleAttributes } from '../../../lib/networking/queries/useGetArticleQuery'
import { Button } from '../../elements/Button'
import { Box, SpanBox } from '../../elements/LayoutPrimitives'
import { styled, theme } from '../../tokens/stitches.config'
import { ReaderSettings } from '../../../lib/hooks/useReaderSettings'
import { useRef } from 'react'
import { ArchiveIcon } from '../../elements/icons/ArchiveIcon'
import { NotebookIcon } from '../../elements/icons/NotebookIcon'
import { TrashIcon } from '../../elements/icons/TrashIcon'
import { LabelIcon } from '../../elements/icons/LabelIcon'
import { EditInfoIcon } from '../../elements/icons/EditInfoIcon'
import { UnarchiveIcon } from '../../elements/icons/UnarchiveIcon'
import { ReaderSettingsIcon } from '../../elements/icons/ReaderSettingsIcon'

export type ArticleActionsMenuLayout = 'top' | 'side'

type ArticleActionsMenuProps = {
  article?: ArticleAttributes
  layout: ArticleActionsMenuLayout
  showReaderDisplaySettings?: boolean
  readerSettings: ReaderSettings
  articleActionHandler: (action: string, arg?: unknown) => void
}

type MenuSeparatorProps = {
  layout: ArticleActionsMenuLayout
}

const MenuSeparator = (props: MenuSeparatorProps): JSX.Element => {
  const LineSeparator = styled(Separator, {
    width: '68%',
    margin: 0,
    borderBottom: `1px solid ${theme.colors.thNotebookSubtle.toString()}`,
    my: '8px',
  })
  return props.layout == 'side' ? <LineSeparator /> : <></>
}

export function ArticleActionsMenu(
  props: ArticleActionsMenuProps
): JSX.Element {
  const displaySettingsButtonRef = useRef<HTMLElement | null>(null)

  return (
    <>
      <Box
        css={{
          display: 'flex',
          alignItems: 'center',
          flexDirection: props.layout == 'side' ? 'column' : 'row',
          justifyContent: props.layout == 'side' ? 'center' : 'flex-end',
          gap: props.layout == 'side' ? '5px' : '25px',
          paddingTop: '6px',
          background: '$readerBg',
          borderRadius: '5px',
        }}
      >
        <Button
          title="Display Settings"
          style="articleActionIcon"
          onClick={() => props.articleActionHandler('editDisplaySettings')}
          css={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <ReaderSettingsIcon
            size={25}
            color={theme.colors.thNotebookSubtle.toString()}
          />
        </Button>

        <MenuSeparator layout={props.layout} />

        <Button
          title="Edit labels (l)"
          style="articleActionIcon"
          onClick={() => props.readerSettings.setShowSetLabelsModal(true)}
        >
          <SpanBox ref={displaySettingsButtonRef}>
            <LabelIcon
              size={24}
              color={theme.colors.thNotebookSubtle.toString()}
            />
          </SpanBox>
        </Button>

        <Button
          title="Edit labels (l)"
          style="articleActionIcon"
          onClick={() => props.articleActionHandler('setLabels')}
          css={{
            display: 'none',
            '@mdDown': {
              display: 'flex',
              alignItems: 'center',
            },
          }}
        >
          <LabelIcon
            size={24}
            color={theme.colors.thNotebookSubtle.toString()}
          />
        </Button>

        <Button
          title="View notebook (t)"
          style="articleActionIcon"
          onClick={() => props.articleActionHandler('showNotebook')}
          css={{
            display: 'flex',
            alignItems: 'center',
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
            display: 'flex',
            alignItems: 'center',
            '@mdDown': {
              display: 'none',
            },
          }}
        >
          <EditInfoIcon
            size={24}
            color={theme.colors.thNotebookSubtle.toString()}
          />
        </Button>

        <MenuSeparator layout={props.layout} />

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
            size={24}
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
            }}
          >
            <ArchiveIcon
              size={24}
              color={theme.colors.thNotebookSubtle.toString()}
            />
          </Button>
        ) : (
          <Button
            title="Unarchive (e)"
            style="articleActionIcon"
            onClick={() => props.articleActionHandler('unarchive')}
          >
            <UnarchiveIcon
              size={24}
              color={theme.colors.thNotebookSubtle.toString()}
            />
          </Button>
        )}
      </Box>
    </>
  )
}
