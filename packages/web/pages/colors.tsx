import { config } from '../components/tokens/stitches.config'
import { Box, HStack, VStack } from '../components/elements/LayoutPrimitives'
import { PrimaryLayout } from '../components/templates/PrimaryLayout'
import { StyledText } from '../components/elements/StyledText'
import { currentThemeName } from '../lib/themeUpdater'

export default function Colors(): JSX.Element {
  const colors = config.theme.colors

  // TODO: update theme name when theme changes
  return (
    <PrimaryLayout
      pageMetaDataProps={{
        title: 'Design - Colors',
        path: '/colors',
      }}
      pageTestId="colors-page-tag"
    >
      <VStack>
        <StyledText style="headline" css={{ m: '$2', p: 0 }}>
          {`Colors (${currentThemeName()})`}
        </StyledText>
        <HStack
          distribution="start"
          css={{ flexWrap: 'wrap', gap: '$3', px: '$3' }}
        >
          {Object.keys(colors).map((colorId) => (
            <ColorTile colorId={colorId} key={colorId} />
          ))}
        </HStack>
      </VStack>
    </PrimaryLayout>
  )
}

type ColorTileProps = {
  colorId: string
}

function ColorTile(props: ColorTileProps) {
  return (
    <VStack alignment="center">
      <Box
        css={{
          width: '150px',
          height: '150px',
          bg: `$${props.colorId}`,
        }}
      />
      <StyledText style="body">{props.colorId}</StyledText>
    </VStack>
  )
}
