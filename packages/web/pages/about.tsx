import { VStack, Box } from './../components/elements/LayoutPrimitives'
import { LandingSectionsContainer, GetStartedButton } from '../components/templates/landing/LandingSectionsContainer'
import { LandingHeader } from '../components/templates/landing/LandingHeader'
import { LandingFooter } from '../components/templates/landing/LandingFooter'

const mobileContainerStyles = {
  alignSelf: 'center',
  marginTop: 80,
  maxWidth: 960,

  px: '2vw',
  '@md': {
    px: '6vw',
  },
  '@xl': {
    px: '120px',
  }
}

const headingStyles = {
  fontWeight: '700',
  color: '#3D3D3D',
  fontSize: 45,
  lineHeight: '53px',
  padding: '10px',
  paddingBottom: '0px',
}


const subHeadingStyles = {
  color: 'rgb(125, 125, 125)',
  padding: '10px',
}

export default function LandingPage(): JSX.Element {
  return (
    <>
      <LandingHeader />
      <VStack css={{ background: '#FEFCF5', color: '#3D3D3D' }}>
        <VStack css={mobileContainerStyles}>
          <Box css={headingStyles}>Omnivore is the read-it-later app for serious readers.</Box>
          <Box css={subHeadingStyles}>
          Distraction free. Privacy focused. Open source.
          </Box>
          
          <Box css={subHeadingStyles}>
            Save interesting articles, newsletter subscriptions, and documents and
          read them later — focused and distraction free. Add notes and highlights.
          Organize your reading list the way you want and sync it across all your
          devices.
          </Box>
          <Box css={{ mb: 40, padding: '10px' }}>
            <GetStartedButton />
          </Box>
        </VStack>
        <LandingSectionsContainer />
      </VStack>
      <LandingFooter />
    </>
  )
}


