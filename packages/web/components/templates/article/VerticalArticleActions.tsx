import { Separator } from '@radix-ui/react-separator'
import {
  ArchiveBox,
  DotsThree,
  DotsThreeOutline,
  HighlighterCircle,
  Info,
  TagSimple,
  TextAa,
  Trash,
  Tray,
} from 'phosphor-react'
import { ArticleAttributes } from '../../../lib/networking/queries/useGetArticleQuery'
import { Button } from '../../elements/Button'
import { Box, HStack, SpanBox } from '../../elements/LayoutPrimitives'
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
            tooltipContent="View Highlights"
            tooltipSide={props.layout == 'side' ? 'right' : 'bottom'}
          >
            <HighlighterCircle
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
            tooltipContent="Edit title & description"
            tooltipSide={props.layout == 'side' ? 'right' : 'bottom'}
          >
            <Info size={24} color={theme.colors.thHighContrast.toString()} />
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
            tooltipContent="Delete"
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
              tooltipContent="Archive"
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
            css={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <TooltipWrapped
              tooltipContent="Unarchive"
              tooltipSide={props.layout == 'side' ? 'right' : 'bottom'}
            >
              <Tray size={24} color={theme.colors.thHighContrast.toString()} />
            </TooltipWrapped>
          </Button>
        )}
        <Button
          style="articleActionIcon"
          onClick={() => props.articleActionHandler('showDisplaySettings')}
          css={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <TooltipWrapped
            tooltipContent="Edit title & description"
            tooltipSide={props.layout == 'side' ? 'right' : 'bottom'}
          >
            <TextAa size={24} color={theme.colors.thHighContrast.toString()} />
          </TooltipWrapped>
        </Button>

        <Button
          style="articleActionIcon"
          onClick={() => props.articleActionHandler('showDisplaySettings')}
          css={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <TooltipWrapped
            tooltipContent="Edit title & description"
            tooltipSide={props.layout == 'side' ? 'right' : 'bottom'}
          >
            <DotsThreeOutline
              size={24}
              color={theme.colors.thHighContrast.toString()}
            />
          </TooltipWrapped>
        </Button>
      </HStack>
    </>
  )
}
