import { Box } from '../../elements/LayoutPrimitives'

export const HEADER_HEIGHT = '70px'

export function PdfHeaderSpacer(): JSX.Element {
  return (
    <Box
      css={{
        height: HEADER_HEIGHT,
        bg: '$grayBase',
      }}
    ></Box>
  )
}
