import { HStack, VStack, Box } from '../../elements/LayoutPrimitives'
import { CSS, styled } from '@stitches/react'

type LandingSectionProps = {
  titleText: string
  descriptionText: React.ReactElement
  icon?: React.ReactElement
  image: React.ReactElement
  containerStyles?: CSS
}

const MainContainer = styled(HStack, {
  width: '100%',
})

const titleTextStyles = {
  fontWeight: '700',
  color: '#3D3D3D',
  lineHeight: 1.5,
  '@mdDown': {
    fontSize: 24,
  },
  '@md': {
    fontSize: '$5',
  },
  '@xl': {
    fontSize: 45,
  },
}

const descriptionTextStyles = {
  color: 'rgb(125, 125, 125)',
}

const imageContainerStyles = {
  width: '50%',
  alignSelf: 'center',
  '@mdDown': {
    width: '100%',
  },
}

const layoutStyles = {
  width: '50%',
  alignSelf: 'center',
  padding: 20,
  '@mdDown': {
    width: '100%',
  },
}

export function LandingSection(props: LandingSectionProps): JSX.Element {
  return (
    <MainContainer css={{ flexWrap: 'wrap', ...props.containerStyles }}>
      <VStack distribution="center" alignment={'center'} css={layoutStyles}>
        <VStack>
          <Box css={titleTextStyles}>{props.titleText}</Box>
          <Box css={descriptionTextStyles}>{props.descriptionText}</Box>
        </VStack>
      </VStack>
      <Box css={imageContainerStyles}>{props.image}</Box>
    </MainContainer>
  )
}
