import { Separator } from "@radix-ui/react-separator"
import { ArchiveBox, DotsThree, HighlighterCircle, TagSimple, TextAa } from "phosphor-react"
import { useRef } from "react"
import { useGetUserPreferences, UserPreferences } from "../../../lib/networking/queries/useGetUserPreferences"
import { Button } from "../../elements/Button"
import { Dropdown } from "../../elements/DropdownElements"
import { Box, SpanBox } from "../../elements/LayoutPrimitives"
import { styled, theme } from "../../tokens/stitches.config"
import { EditLabelsModal } from "./EditLabelsModal"
import { ReaderSettings } from "./ReaderSettingsModal"

export type ArticleActionsMenuLayout = 'horizontal' | 'vertical'

type ArticleActionsMenuProps = {
  layout: ArticleActionsMenuLayout
  articleActionHandler: (action: string, arg?: number) => void
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
    css={{  m: '0px', p: '0px' }}
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
        flexDirection: props.layout == 'vertical' ? 'column' : 'row',
        alignItems: 'center',
        justifyContent: props.layout == 'vertical' ? 'center' : 'flex-end',
        gap: props.layout == 'vertical' ? '8px' : '20px',
        paddingTop: '6px',
        height: '100%',
        width: '100%',
        m: '0px',
      }}
    >
      <ActionDropdown
        layout={props.layout}
        triggerElement={
          <SpanBox css={{ width: '100%', marginLeft: 'auto', marginRight: 'auto' }}>
            <TextAa size={24} color={theme.colors.readerFont.toString()} />
          </SpanBox>
        }
      >
        <ReaderSettings userPreferences={preferencesData} articleActionHandler={props.articleActionHandler} />
      </ActionDropdown>

      <MenuSeparator layout={props.layout} />

      <ActionDropdown
        layout={props.layout}
        triggerElement={
          <SpanBox css={{ width: '100%', marginLeft: 'auto', marginRight: 'auto' }}>
            <TagSimple size={24} color={theme.colors.readerFont.toString()} />
          </SpanBox>
        }
      >
        <EditLabelsModal />
      </ActionDropdown>

      <Button style='articleActionIcon' onClick={() => props.articleActionHandler('showHighlights')}>
        <HighlighterCircle size={24} color={theme.colors.readerFont.toString()} />
      </Button>
      <MenuSeparator layout={props.layout} />

      <Button style='articleActionIcon' onClick={() => props.articleActionHandler('archive')}>
        <ArchiveBox size={24} color={theme.colors.readerFont.toString()} />
      </Button>
      {/* <MenuSeparator layout={props.layout} />

      <Button style='articleActionIcon'>
        <DotsThree size={24} color={theme.colors.readerFont.toString()} />
      </Button> */}
    </Box>
    </>
  )
}