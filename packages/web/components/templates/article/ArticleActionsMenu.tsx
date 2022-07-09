import { Separator } from "@radix-ui/react-separator"
import { ArchiveBox, DotsThree, HighlighterCircle, TagSimple, TextAa, Tray } from "phosphor-react"
import { ArticleAttributes } from "../../../lib/networking/queries/useGetArticleQuery"
import { Button } from "../../elements/Button"
import { Dropdown } from "../../elements/DropdownElements"
import { Box, SpanBox } from "../../elements/LayoutPrimitives"
import { TooltipWrapped } from "../../elements/Tooltip"
import { styled, theme } from "../../tokens/stitches.config"
import { SetLabelsControl } from "./SetLabelsControl"
import { DisplaySettingsModal } from "./DisplaySettingsModal"
import { useReaderSettings } from "../../../lib/hooks/useReaderSettings"
import { useRef } from "react"

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
    borderBottom: `1px solid ${theme.colors.grayLine.toString()}`,
    my: '8px',
  })
  return (props.layout == 'side' ? <LineSeparator /> : <></>)
}

type ActionDropdownProps = {
  layout: ArticleActionsMenuLayout
  triggerElement: JSX.Element
  children: JSX.Element
}

const ActionDropdown = (props: ActionDropdownProps): JSX.Element => {
  return <Dropdown
    showArrow={false}
    css={{ m: '0px', p: '0px', overflow: 'hidden', width: '265px', maxWidth: '265px', '@smDown': { width: '230px' } }}
    side={props.layout == 'side' ? 'right' : 'bottom'}
    sideOffset={props.layout == 'side' ? 8 : 0}
    align={props.layout == 'side' ? 'start' : 'center'}
    alignOffset={props.layout == 'side' ? -18 : undefined}
    triggerElement={props.triggerElement}
  >
    {props.children}
  </Dropdown>
}

export function ArticleActionsMenu(props: ArticleActionsMenuProps): JSX.Element {
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
        gap: props.layout == 'side' ? '8px' : '24px',
        paddingTop: '6px',
      }}
    >
      {props.showReaderDisplaySettings && (
        <>
        <Button style='articleActionIcon' onClick={() => readerSettings.setShowEditDisplaySettingsModal(true)}>
          <TooltipWrapped
            tooltipContent="Adjust Display Settings"
            tooltipSide={props.layout == 'side' ? 'right' : 'bottom'}
          >
            <SpanBox ref={displaySettingsButtonRef}>
              <TextAa size={24} color={theme.colors.readerFont.toString()}  />
            </SpanBox>
          </TooltipWrapped>
        </Button>
        <MenuSeparator layout={props.layout} />
        </>
      )}
      <SpanBox css={{
        'display': 'flex',
        '@smDown': {
          display: 'none',
        }}}
      >
        {props.article ? (
          <ActionDropdown
            layout={props.layout}
            triggerElement={
              <TooltipWrapped
                tooltipContent="Edit labels"
                tooltipSide={props.layout == 'side' ? 'right' : 'bottom'}
            >
              <TagSimple size={24} color={theme.colors.readerFont.toString()} />
            </TooltipWrapped>
            }
          >
            <SetLabelsControl
              article={props.article}
              linkId={props.article.linkId}
              labels={props.article.labels}
              articleActionHandler={props.articleActionHandler}
            />
          </ActionDropdown>
        ) : (
          <Button style='articleActionIcon'
          css={{
            '@smDown': {
              display: 'flex',
            },
          }}>
            <TagSimple size={24} color={theme.colors.readerFont.toString()} />
          </Button>
        )}
      </SpanBox>

      <Button style='articleActionIcon'
        onClick={() => props.articleActionHandler('setLabels')}
        css={{
          'display': 'none',
          '@smDown': {
            display: 'flex',
          },
      }}>
          <TagSimple size={24} color={theme.colors.readerFont.toString()} />
      </Button>

      <Button style='articleActionIcon' onClick={() => props.articleActionHandler('showHighlights')}>
        <TooltipWrapped
          tooltipContent="View Highlights"
          tooltipSide={props.layout == 'side' ? 'right' : 'bottom'}
        >
          <HighlighterCircle size={24} color={theme.colors.readerFont.toString()} />
        </TooltipWrapped>
      </Button>

      <MenuSeparator layout={props.layout} />

      {!props.article?.isArchived ? (
          <Button
            style="articleActionIcon"
            onClick={() => props.articleActionHandler('archive')}
          >
            <TooltipWrapped
              tooltipContent="Archive"
              tooltipSide={props.layout == 'side' ? 'right' : 'bottom'}
            >
              <ArchiveBox
                size={24}
                color={theme.colors.readerFont.toString()}
              />
            </TooltipWrapped>
          </Button>
        ) : (
          <Button
            style="articleActionIcon"
            onClick={() => props.articleActionHandler('unarchive')}
          >
            <TooltipWrapped
              tooltipContent="Unarchive"
              tooltipSide={props.layout == 'side' ? 'right' : 'bottom'}
            >
              <Tray
                size={24}
                color={theme.colors.readerFont.toString()}
              />
            </TooltipWrapped>
          </Button>
        )}

      {/* <MenuSeparator layout={props.layout} />

      <Button style='articleActionIcon'>
        <DotsThree size={24} color={theme.colors.readerFont.toString()} />
      </Button> */}
    </Box>
    {readerSettings.showEditDisplaySettingsModal && (
      <DisplaySettingsModal
        centerX={props.layout != 'side'}
        triggerElementRef={displaySettingsButtonRef}
        articleActionHandler={props.articleActionHandler}
        onOpenChange={() => readerSettings.setShowEditDisplaySettingsModal(false)}
      />
    )}
    </>
  )
}
