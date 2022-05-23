import { Box, VStack, HStack } from '../elements/LayoutPrimitives'
import { OmnivoreNameLogo } from '../elements/images/OmnivoreNameLogo'
import { theme } from '../tokens/stitches.config'

type ProfileLayoutProps = {
  children: React.ReactNode
}

export function ProfileLayout(props: ProfileLayoutProps): JSX.Element {
  return (
    <>
      <VStack
        alignment="center"
        distribution="center"
        css={{ bg: '$omnivoreYellow', height: '100vh' }}
      >
        <Box
          css={{
            position: 'relative',
            height: '100%',
            width: '100%',
          }}
        ></Box>
        {props.children}
      </VStack>

      <Box
        css={{
          position: 'absolute',
          top: 0,
          left: 0,
          m: '0',
          width: '100%',
        }}
      >
        <HStack
          alignment="center"
          distribution="between"
          css={{
            mt: '1px',
            ml: '18px',
            mr: '0',
            '@smDown': {
              ml: '8px',
              mt: '10px',
            },
          }}
        >
          <OmnivoreNameLogo color={theme.colors.omnivoreGray.toString()} />
        </HStack>
      </Box>
    </>
  )
}
