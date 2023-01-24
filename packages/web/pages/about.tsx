import { VStack, Box } from './../components/elements/LayoutPrimitives'
import {
  LandingSectionsContainer,
  GetStartedButton,
} from '../components/templates/landing/LandingSectionsContainer'
import { LandingHeader } from '../components/templates/landing/LandingHeader'
import { LandingFooter } from '../components/templates/landing/LandingFooter'
import { PageMetaData } from '../components/patterns/PageMetaData'
import { About } from '../components/templates/About'

const containerStyles = {
  alignSelf: 'center',
  marginTop: 80,
  maxWidth: 960,
  px: '2vw',
  '@md': {
    px: '6vw',
  },
  '@xl': {
    px: '120px',
  },
}

const headingStyles = {
  fontWeight: '700',
  color: '#3D3D3D',
  fontSize: 45,
  lineHeight: '53px',
  padding: '10px',
  paddingBottom: '0px',
  textAlign: 'center',
}

const subHeadingStyles = {
  color: 'rgb(125, 125, 125)',
  padding: '10px',
  textAlign: 'center',
  width: '100%',
  fontWeight: '600',
}

export default function LandingPage(): JSX.Element {
  return (
    <>
      <PageMetaData
        title="Omnivore"
        path="/about"
        ogImage="/static/images/og-homepage-03.png"
        description="Omnivore is the free, open source, read-it-later app for serious readers."
      />

      <About />
    </>
  )
}
