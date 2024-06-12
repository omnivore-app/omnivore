import { DotsThreeVertical } from '@phosphor-icons/react'
import { theme } from '../tokens/stitches.config'
import { Box } from './LayoutPrimitives'

export function MenuTrigger(): JSX.Element {
  return (
    <Box
      css={{
        display: 'flex',
        height: '20px',
        width: '20px',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '1000px',
        '&:hover': {
          bg: '#898989',
        },
      }}
    >
      <DotsThreeVertical
        size={20}
        color={theme.colors.thTextContrast2.toString()}
        weight="bold"
      />
    </Box>
  )
}
