import { Box } from '../../elements/LayoutPrimitives'

export const HEADER_HEIGHT = '110px'

export function HeaderSpacer(): JSX.Element {
  return (
    <Box
      css={{
        height: HEADER_HEIGHT,
        bg: '$grayBase',
      }}
    ></Box>
  )
}
