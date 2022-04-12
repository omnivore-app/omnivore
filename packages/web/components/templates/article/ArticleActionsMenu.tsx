import { Separator } from "@radix-ui/react-separator"
import { ArchiveBox, DotsThree, HighlighterCircle, TagSimple, TextAa } from "phosphor-react"
import { ArticleAttributes } from "../../../lib/networking/queries/useGetArticleQuery"
import { useGetUserPreferences } from "../../../lib/networking/queries/useGetUserPreferences"
import { Button } from "../../elements/Button"
import { Dropdown } from "../../elements/DropdownElements"
import { Box, SpanBox } from "../../elements/LayoutPrimitives"
import { TooltipWrapped } from "../../elements/Tooltip"
import { styled, theme } from "../../tokens/stitches.config"
import { EditLabelsControl } from "./EditLabelsControl"
import { ReaderSettings } from "./ReaderSettingsModal"

export type ArticleActionsMenuLayout = 'horizontal' | 'vertical'

type ArticleActionsMenuProps = {
  article: ArticleAttributes
  layout: ArticleActionsMenuLayout
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
  return (props.layout == 'vertical' ? <LineSeparator /> : <></>)
}

type ActionDropdownProps = {
  layout: ArticleActionsMenuLayout
  triggerElement: JSX.Element
  children: JSX.Element
}

const ActionDropdown = (props: ActionDropdownProps): JSX.Element => {
  return <Dropdown
    showArrow={true}
    css={{ m: '0px', p: '0px', overflow: 'hidden', width: '265px', maxWidth: '265px', '@smDown': { width: '230px' } }}
    side={props.layout == 'vertical' ? 'right' : 'bottom'}
    sideOffset={props.layout == 'vertical' ? 8 : 0}
    align={props.layout == 'vertical' ? 'start' : 'center'}
    alignOffset={props.layout == 'vertical' ? -18 : undefined}
    triggerElement={props.triggerElement}
  >
    {props.children}
  </Dropdown>
}

export function ArticleActionsMenu(props: ArticleActionsMenuProps): JSX.Element {
  const { preferencesData } = useGetUserPreferences()

  return (
    <>
    <Box
      css={{
        display: 'flex',
        alignItems: 'center',
        flexDirection: props.layout == 'vertical' ? 'column' : 'row',
        justifyContent: props.layout == 'vertical' ? 'center' : 'flex-end',
        gap: props.layout == 'vertical' ? '8px' : '20px',
        paddingTop: '6px',
        m: '0px',
      }}
    >

      <ActionDropdown
        layout={props.layout}
        triggerElement={
          <TooltipWrapped
            tooltipContent="Adjust Display Settings"
            tooltipSide={props.layout == 'vertical' ? 'right' : 'bottom'}
          >
          <TextAa size={24} color={theme.colors.readerFont.toString()} />
        </TooltipWrapped>
        }
      >
        <ReaderSettings userPreferences={preferencesData} articleActionHandler={props.articleActionHandler} />
      </ActionDropdown>

      <MenuSeparator layout={props.layout} />

      <SpanBox css={{
        'display': 'flex',
        '@smDown': {
          display: 'none',
        }}}
      >
        <ActionDropdown
          layout={props.layout}
          triggerElement={
            <TooltipWrapped
              tooltipContent="Edit Tags"
              tooltipSide={props.layout == 'vertical' ? 'right' : 'bottom'}
          >
            <TagSimple size={24} color={theme.colors.readerFont.toString()} />
          </TooltipWrapped>
          }
        >
          <EditLabelsControl
            article={props.article}
            articleActionHandler={props.articleActionHandler}
          />
        </ActionDropdown>
      </SpanBox>

      <Button style='articleActionIcon'
        onClick={() => props.articleActionHandler('editLabels')}
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
          tooltipSide={props.layout == 'vertical' ? 'right' : 'bottom'}
        >
          <HighlighterCircle size={24} color={theme.colors.readerFont.toString()} />
        </TooltipWrapped>
      </Button>

      <MenuSeparator layout={props.layout} />

      <Button style='articleActionIcon' onClick={() => props.articleActionHandler('archive')}>
        <TooltipWrapped
          tooltipContent="Archive"
          tooltipSide={props.layout == 'vertical' ? 'right' : 'bottom'}
        >
          <ArchiveBox size={24} color={theme.colors.readerFont.toString()} />
        </TooltipWrapped>
      </Button>
      {/* <MenuSeparator layout={props.layout} />

      <Button style='articleActionIcon'>
        <DotsThree size={24} color={theme.colors.readerFont.toString()} />
      </Button> */}
    </Box>
    </>
  )
}