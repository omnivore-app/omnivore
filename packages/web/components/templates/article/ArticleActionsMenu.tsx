import { Separator } from '@radix-ui/react-separator'
import {
  ArchiveBox,
  Notebook,
  Info,
  TagSimple,
  Trash,
  Tray,
} from 'phosphor-react'
import { ArticleAttributes } from '../../../lib/networking/queries/useGetArticleQuery'
import { Button } from '../../elements/Button'
import { Box, SpanBox } from '../../elements/LayoutPrimitives'
import { TooltipWrapped } from '../../elements/Tooltip'
import { styled, theme } from '../../tokens/stitches.config'
import { useReaderSettings } from '../../../lib/hooks/useReaderSettings'
import { useRef } from 'react'
import { setLabelsMutation } from '../../../lib/networking/mutations/setLabelsMutation'
import { Label } from '../../../lib/networking/fragments/labelFragment'
import { SetLabelsModal } from './SetLabelsModal'

export type ArticleActionsMenuLayout = 'top' | 'side'

type ArticleActionsMenuProps = {
  article?: ArticleAttributes
  layout: ArticleActionsMenuLayout
  showReaderDisplaySettings?: boolean
  articleActionHandler: (action: string, arg?: unknown) => void
}

type MenuSeparatorProps = {
  layout: ArticleActionsMenuLayout
}

const MenuSeparator = (props: MenuSeparatorProps): JSX.Element => {
  const LineSeparator = styled(Separator, {
    width: '100%',
    margin: 0,
    borderBottom: `1px solid ${theme.colors.thHighContrast.toString()}`,
    my: '8px',
  })
  return props.layout == 'side' ? <LineSeparator /> : <></>
}

export function ArticleActionsMenu(
  props: ArticleActionsMenuProps
): JSX.Element {
  const readerSettings = useReaderSettings()
  const displaySettingsButtonRef = useRef<HTMLElement | null>(null)

  return (
    <>
      <Box
        css={{
          display: 'flex',
          alignItems: 'center',
          flexDirection: props.layout == 'side' ? 'column' : 'row',
          justifyContent: props.layout == 'side' ? 'center' : 'flex-end',
          gap: props.layout == 'side' ? '15px' : '25px',
          paddingTop: '6px',
        }}
      >
        <SpanBox
          css={{
            display: 'flex',
            alignItems: 'center',
            '@mdDown': {
              display: 'none',
            },
          }}
        >
          {props.article ? (
            <>
              <Button
                style="articleActionIcon"
                onClick={() => readerSettings.setShowSetLabelsModal(true)}
              >
                <TooltipWrapped
                  tooltipContent="Edit labels (l)"
                  tooltipSide={props.layout == 'side' ? 'right' : 'bottom'}
                >
                  <SpanBox ref={displaySettingsButtonRef}>
                    <TagSimple
                      size={24}
                      color={theme.colors.thHighContrast.toString()}
                    />
                  </SpanBox>
                </TooltipWrapped>
              </Button>
              <MenuSeparator layout={props.layout} />
            </>
          ) : (
            <Button
              style="articleActionIcon"
              css={{
                '@smDown': {
                  display: 'flex',
                },
              }}
            >
              <TagSimple
                size={24}
                color={theme.colors.thHighContrast.toString()}
              />
            </Button>
          )}
        </SpanBox>

        <Button
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
          <TagSimple size={24} color={theme.colors.thHighContrast.toString()} />
        </Button>

        <Button
          style="articleActionIcon"
          onClick={() => props.articleActionHandler('showHighlights')}
          css={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <TooltipWrapped
            tooltipContent="View Notebook (t)"
            tooltipSide={props.layout == 'side' ? 'right' : 'bottom'}
          >
            <Notebook
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
            <Info size={24} color={theme.colors.thHighContrast.toString()} />
          </TooltipWrapped>
        </Button>

        <MenuSeparator layout={props.layout} />

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
            <Trash size={24} color={theme.colors.thHighContrast.toString()} />
          </TooltipWrapped>
        </Button>

        {!props.article?.isArchived ? (
          <Button
            style="articleActionIcon"
            onClick={() => props.articleActionHandler('archive')}
            css={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <TooltipWrapped
              tooltipContent="Archive (e)"
              tooltipSide={props.layout == 'side' ? 'right' : 'bottom'}
            >
              <ArchiveBox
                size={24}
                color={theme.colors.thHighContrast.toString()}
              />
            </TooltipWrapped>
          </Button>
        ) : (
          <Button
            style="articleActionIcon"
            onClick={() => props.articleActionHandler('unarchive')}
          >
            <TooltipWrapped
              tooltipContent="Unarchive (u)"
              tooltipSide={props.layout == 'side' ? 'right' : 'bottom'}
            >
              <Tray size={24} color={theme.colors.thHighContrast.toString()} />
            </TooltipWrapped>
          </Button>
        )}

        {/* <MenuSeparator layout={props.layout} />
      <Button style='articleActionIcon'>
        <DotsThree size={24} color={theme.colors.readerFont.toString()} />
      </Button> */}
      </Box>

      {props.article && readerSettings.showSetLabelsModal && (
        <SetLabelsModal
          provider={props.article}
          onOpenChange={(open: boolean) => {
            readerSettings.setShowSetLabelsModal(false)
          }}
          onLabelsUpdated={(labels: Label[]) => {
            props.articleActionHandler('refreshLabels', labels)
          }}
          save={(labels: Label[]) => {
            if (props.article?.id) {
              return (
                setLabelsMutation(
                  props.article?.id,
                  labels.map((l) => l.id)
                ) ?? []
              )
            }
            return Promise.resolve(labels)
          }}
        />
      )}
    </>
  )
}
