import { HStack, VStack, Box } from '../../elements/LayoutPrimitives'
import { CSS, styled } from '@stitches/react'

type LandingSectionProps = {
  titleText: string,
  descriptionText: React.ReactElement,
  icon: React.ReactElement,
  image: React.ReactElement,
  containerStyles?: CSS,
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
  }
}

const descriptionTextStyles = {
  color: 'rgb(125, 125, 125)',
}

const iconContainerStyles = {
  width: 56,
  height: 56,
  background: 'white',
  border: '1px solid rgba(61, 61, 61, 0.08)',
  boxSizing: 'border-box',
  borderRadius: '50%',
  '@mdDown': {
    width: 32,
    height: 32,
    padding: 5,
  },
}

const imageContainerStyles = {
  width: '50%',
  '@mdDown': {
    width: 0,
    display: 'none',
  }
}

const layoutStyles = {
  width: '50%',
  padding: 10,
  '@mdDown': {
    width: '100%',
  }
}

const innerLayoutStyles = {
  maxWidth: 480,
  alignSelf: 'center',
  '@mdDown': {
    alignItems: 'center',
  },
}
  
export function LandingSection(props: LandingSectionProps): JSX.Element {
    return (
      <MainContainer distribution='start' alignment='center' css={props.containerStyles}>
        <VStack distribution='center' css={layoutStyles}>
          <VStack css={innerLayoutStyles}>
            <VStack distribution='center' alignment='center' css={iconContainerStyles}>
              {props.icon}
            </VStack>
            <Box css={titleTextStyles}>{props.titleText}</Box>
            <Box css={descriptionTextStyles}>{props.descriptionText}</Box>
          </VStack>
        </VStack>
        <HStack distribution='center' css={imageContainerStyles}>
          {props.image}
        </HStack>
      </MainContainer>
    )
}
