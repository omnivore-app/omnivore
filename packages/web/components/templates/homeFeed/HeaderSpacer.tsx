import { Box } from '../../elements/LayoutPrimitives'

export const HEADER_HEIGHT = '105px'
export const MOBILE_HEADER_HEIGHT = '70px'

export function HeaderSpacer(): JSX.Element {
  return (
    <Box
      css={{
        height: HEADER_HEIGHT,
        bg: '$grayBase',
        '@mdDown': {
          height: MOBILE_HEADER_HEIGHT,
        },
      }}
    ></Box>
  )
}
