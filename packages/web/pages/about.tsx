import { VStack, Box } from './../components/elements/LayoutPrimitives'
import { LandingSectionsContainer, GetStartedButton } from '../components/templates/landing/LandingSectionsContainer'
import { LandingHeader } from '../components/templates/landing/LandingHeader'
import { LandingFooter } from '../components/templates/landing/LandingFooter'

const mobileContainerStyles = {
  maxWidth: 430,
  alignSelf: 'center',
  marginTop: 80,
  padding: '10px',
}

const headingStyles = {
  fontWeight: '700',
  color: '#3D3D3D',
  fontSize: 45,
  lineHeight: '53px',
  padding: '10px',
}


const subHeadingStyles = {
  color: 'rgb(125, 125, 125)',
  mb: 32,
  padding: '10px',
}

export default function LandingPage(): JSX.Element {
  return (
    <>
      <LandingHeader />
      <VStack css={{ background: '#FEFCF5', color: '#3D3D3D' }}>
        <VStack css={mobileContainerStyles}>
          <Box css={headingStyles}>A read-it-later app for serious readers.</Box>
          <Box css={subHeadingStyles}>
            Omnivore is a privacy focused, open-source read-it-later app.
            Use it to save interesting articles and read distraction free.
            Add notes and highlights.
            Organise your reading queue the way you want and sync it across all your devices.
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


