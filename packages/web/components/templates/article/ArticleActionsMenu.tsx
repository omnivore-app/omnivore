import { Separator } from "@radix-ui/react-separator"
import { ArchiveBox, DotsThree, HighlighterCircle, TagSimple, TextAa } from "phosphor-react"
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

export function MenuSeparator(props: MenuSeparatorProps) {
  const LineSeparator = styled(Separator, {
    width: '100%',
    margin: 0,
    borderBottom: `1px solid ${theme.colors.grayLine.toString()}`,
    my: '8px',
  })
  return (props.layout == 'vertical' ? <LineSeparator /> : <></>)
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
      <Dropdown
        side={props.layout == 'vertical' ? 'right' : 'bottom'}
        sideOffset={props.layout == 'vertical' ? 8 : 0}
        align={props.layout == 'vertical' ? 'start' : 'center'}
        triggerElement={
          <SpanBox css={{ width: '100%', marginLeft: 'auto', marginRight: 'auto' }}>
            <TextAa size={24} color={theme.colors.readerFont.toString()} />
          </SpanBox>
        }
        css={{  m: '0px', p: '0px' }}
      >
        <ReaderSettings userPreferences={preferencesData} articleActionHandler={props.articleActionHandler} />
      </Dropdown>

      <MenuSeparator layout={props.layout} />

      <Dropdown
        side={props.layout == 'vertical' ? 'right' : 'bottom'}
        sideOffset={props.layout == 'vertical' ? 8 : 0}
        showArrow={true}
        align={props.layout == 'vertical' ? 'start' : 'center'}
        triggerElement={
          <SpanBox css={{ width: '100%', marginLeft: 'auto', marginRight: 'auto' }}>
            <TagSimple size={24} color={theme.colors.readerFont.toString()} />
          </SpanBox>
        }
        css={{  m: '0px', p: '0px' }}
      >
        <EditLabelsModal />
        {/* <EditLabelsModal> */}
      </Dropdown>

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