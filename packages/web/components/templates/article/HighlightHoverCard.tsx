import { Box } from '../../elements/LayoutPrimitives'
import { theme } from '../../tokens/stitches.config'
import { Highlight } from '../../../lib/networking/fragments/highlightFragment'
import { HighlightView } from '../../patterns/HighlightView'

type PageCoordinates = {
  pageX: number
  pageY: number
}

type HighlightHoverCardProps = {
  highlight: Highlight
  anchorCoordinates: PageCoordinates
}

export function HighlightHoverCard(
  props: HighlightHoverCardProps
): JSX.Element {
  return (
    <Box
      css={{
        width: '100%',
        maxWidth: '330px',
        // height: '48px',
        position: 'absolute',
        background: '$grayBg',
        borderRadius: '4px',
        border: '1px solid $grayBorder',
        boxShadow: theme.shadows.cardBoxShadow.toString(),
        left: props.anchorCoordinates.pageX,
        top: props.anchorCoordinates.pageY,
      }}
    >
      <HighlightView highlight={props.highlight} />
    </Box>
  )
}
