import { VStack, Box } from './../components/elements/LayoutPrimitives'
import { LandingSectionsContainer, GetStartedButton } from '../components/templates/landing/LandingSectionsContainer'
import { LandingHeader } from '../components/templates/landing/LandingHeader'
import { LandingFooter } from '../components/templates/landing/LandingFooter'

const mobileContainerStyles = {
  maxWidth: 430,
  alignSelf: 'center',
  px: 10,
  display: 'none',
  marginTop: 60,
  '@mdDown': {
    display: 'flex',
  }
}

const headingStyles = {
  fontWeight: '700',
  fontSize: 42,
  lineHeight: '46px',
  mb: 16
}

const subHeadingStyles = {
  fontWeight: '700',
  fontSize: 24,
  lineHeight: '36px',
  color: '#5F5E58',
  mb: 32,
}

export default function LandingPage(): JSX.Element {
  return (
    <>
      <LandingHeader />
      <VStack css={{ background: '#FEFCF5', color: '#3D3D3D' }}>
        <VStack css={mobileContainerStyles}>
          <Box css={headingStyles}>Collect and share the best of the web</Box>
          <Box css={subHeadingStyles}>
            Everything you read. Safe, organized, and easy to share.
          </Box>
          <Box css={{mb: 40}}>
            <GetStartedButton />
          </Box>
        </VStack>
        <LandingSectionsContainer />
      </VStack>
      <LandingFooter />
    </>
  )
}
