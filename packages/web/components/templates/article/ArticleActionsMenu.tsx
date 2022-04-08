import { Separator } from "@radix-ui/react-separator"
import { ArchiveBox, DotsThree, HighlighterCircle, TagSimple, TextAa } from "phosphor-react"
import { Button } from "../../elements/Button"
import { Box } from "../../elements/LayoutPrimitives"
import { styled, theme } from "../../tokens/stitches.config"

export type ArticleActionsMenuLayout = 'horizontal' | 'vertical'

type ArticleActionsMenuProps = {
  // pageTestId: string
  // hideHeader?: boolean
  // pageMetaDataProps?: PageMetaDataProps
  // scrollElementRef?: MutableRefObject<HTMLDivElement | null>
  // displayFontStepper?: boolean
  layout: ArticleActionsMenuLayout
}



export function MenuSeparator(props: ArticleActionsMenuProps) {
  const LineSeparator = styled(Separator, {
    width: '100%',
    margin: 0,
    backgroundColor: 'red',
    borderBottom: `1px solid ${theme.colors.grayLine.toString()}`,
    my: '8px',
  })
  return (props.layout == 'vertical' ? <LineSeparator /> : <></>)
}

export function ArticleActionsMenu(props: ArticleActionsMenuProps): JSX.Element {
  return (
    <Box
      css={{
        display: 'flex',
        flexDirection: props.layout == 'vertical' ? 'column' : 'row',
        alignItems: props.layout == 'vertical' ? 'flex-start' : 'center',
        justifyContent: props.layout == 'vertical' ? 'center' : 'flex-end',
        paddingTop: '6px',
        gap: '4px',
        height: '100%',
        width: '100%',
        m: '0px',
      }}
    >
      <Button style='articleActionIcon'>
        <TextAa size={24} color={theme.colors.readerFont.toString()} />
      </Button>
      <MenuSeparator layout={props.layout} />

      <Button style='articleActionIcon'>
        <TagSimple size={24} color={theme.colors.readerFont.toString()} />
      </Button>
      <Button style='articleActionIcon'>
        <HighlighterCircle size={24} color={theme.colors.readerFont.toString()} />
      </Button>
      <MenuSeparator layout={props.layout} />

      <Button style='articleActionIcon'>
        <ArchiveBox size={24} color={theme.colors.readerFont.toString()} />
      </Button>
      <MenuSeparator layout={props.layout} />

      <Button style='articleActionIcon'>
        <DotsThree size={24} color={theme.colors.readerFont.toString()} />
      </Button>
    </Box>
  )
}