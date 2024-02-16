import { Box } from '../../elements/LayoutPrimitives'

export const DEFAULT_HEADER_HEIGHT = '85px'

export function HeaderSpacer(): JSX.Element {
  return (
    <Box
      css={{
        height: DEFAULT_HEADER_HEIGHT,
        bg: '$grayBase',
        '@mdDown': {
          height: DEFAULT_HEADER_HEIGHT,
        },
      }}
    ></Box>
  )
}
