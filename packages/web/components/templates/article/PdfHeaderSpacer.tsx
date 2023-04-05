import { Box } from '../../elements/LayoutPrimitives'

export const HEADER_HEIGHT = '105px'
export const MOBILE_HEADER_HEIGHT = '70px'

export function PdfHeaderSpacer(): JSX.Element {
  return (
    <Box
      css={{
        height: HEADER_HEIGHT,
        bg: '$grayBase',
        '@xlgDown': {
          height: MOBILE_HEADER_HEIGHT,
        },
      }}
    ></Box>
  )
}
