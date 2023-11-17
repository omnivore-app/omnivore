import { UserBasicData } from "../../../../lib/networking/queries/useGetViewerQuery"
import { Box } from "../../../elements/LayoutPrimitives"
import { Button } from "../../../elements/Button"
import { theme } from "../../../tokens/stitches.config"
import { BookmarkSimple, Browsers } from "phosphor-react"
import { DiscoveryItem } from "./DiscoveryItem"
import { timeZone, locale } from "../../../../lib/dateFormatting"

type DiscoveryHoverActions = {
  viewer: UserBasicData
  isHovered: boolean
  handleLinkSubmission: (
    link: string,
    timezone: string,
    locale: string
  ) => Promise<void>
  item: DiscoveryItem
}

export const DiscoveryHoverActions = (props: DiscoveryHoverActions) => {

  return (
    <Box
      css={{
        overflow: 'clip',

        height: '33px',
        width: '75px',
        bg: '$thBackground',
        display: 'flex',

        pt: '0px',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid $thBackground5',
        borderRadius: '5px',
        visibility: props.isHovered ? 'visible' : 'hidden',

        gap: '5px',
        px: '5px',
        '&:hover': {
          boxShadow:
            '0 1px 3px 0 rgba(0, 0, 0, 0.1),0 1px 2px 0 rgba(0, 0, 0, 0.06);',
        },
      }}
    >
      <Button
        title="Add to Library (A)"
        style="hoverActionIcon"
        onClick={(event) => {
          props.handleLinkSubmission(props.item.url, timeZone, locale)
          event.preventDefault()
          event.stopPropagation()
        }}
      >
        <BookmarkSimple size={21} color={theme.colors.thNotebookSubtle.toString()} />
      </Button>
      <Button
        title="Go to Original Article (O)"
        style="hoverActionIcon"
        onClick={(event) => {
          // OK So we go to the original article.
          window.open(props.item.url, "_blank", "noreferrer");
          event.preventDefault()
          event.stopPropagation()
        }}
      >
        <Browsers size={21} color={theme.colors.thNotebookSubtle.toString()} />
      </Button>

    </Box>
  )
}
