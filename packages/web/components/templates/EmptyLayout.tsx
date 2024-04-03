import { Box, HStack, VStack } from '../elements/LayoutPrimitives'
import { PageMetaData } from '../patterns/PageMetaData'
import { DEFAULT_HEADER_HEIGHT } from './homeFeed/HeaderSpacer'
import { SettingsDropdown } from './navMenu/SettingsDropdown'

type EmptyLayoutProps = {
  title: string
  children: React.ReactNode
}

export function EmptyLayout(props: EmptyLayoutProps): JSX.Element {
  return (
    <VStack
      alignment="start"
      distribution="start"
      css={{ width: '100%', height: '100%', minHeight: '100vh' }}
    >
      <PageMetaData path="/" title={props.title} />
      <VStack css={{ width: '100%', height: '100%' }}>
        <Box
          css={{
            height: DEFAULT_HEADER_HEIGHT,
            '@mdDown': {
              display: 'none',
            },
          }}
        ></Box>
        <Box
          css={{
            p: '15px',
            display: 'none',
            height: DEFAULT_HEADER_HEIGHT,
            '@mdDown': {
              display: 'flex',
            },
          }}
        >
          <SettingsDropdown />
        </Box>
        <HStack css={{ width: '100%', height: '100%' }} distribution="start">
          {props.children}
        </HStack>
        <Box css={{ height: '120px', width: '100%' }} />
      </VStack>
    </VStack>
  )
}
