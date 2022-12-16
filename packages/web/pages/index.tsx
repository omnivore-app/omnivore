import { VStack, Box } from './../components/elements/LayoutPrimitives'
import {
  LandingSectionsContainer,
  GetStartedButton,
} from '../components/templates/landing/LandingSectionsContainer'
import { LandingHeader } from '../components/templates/landing/LandingHeader'
import { LandingFooter } from '../components/templates/landing/LandingFooter'
import { useGetViewerQuery } from '../lib/networking/queries/useGetViewerQuery'
import { useRouter } from 'next/router'
import { PageMetaData } from '../components/patterns/PageMetaData'
import { LoadingView } from '../components/patterns/LoadingView'

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
  const router = useRouter()
  const { viewerData, viewerDataError, isLoading } = useGetViewerQuery()

  if (!isLoading && router.isReady && viewerData?.me) {
    router.push('/home')
    return <></>
  } else if (isLoading) {
    return <LoadingView bgColor="#FEFCF5" />
  }

  return (
    <>
      <PageMetaData
        title="Omnivore"
        path="/"
        ogImage="/static/images/og-homepage.png"
      />

      <LandingHeader />
      <VStack
        alignment="center"
        css={{ background: '#FEFCF5', color: '#3D3D3D' }}
      >
        <VStack css={mobileContainerStyles}>
          <Box css={headingStyles}>
            Omnivore is the free, open source, read-it-later app for serious
            readers.
          </Box>
          <Box css={subHeadingStyles}>
            Distraction free. Privacy focused. Open source.
          </Box>

          <Box
            css={{
              color: 'rgb(125, 125, 125)',
              padding: '10px',
              textAlign: 'center',
            }}
          >
            Save interesting articles, newsletter subscriptions, and documents
            and read them later — focused and distraction free. Add notes and
            highlights. Organize your reading list the way you want and sync it
            across all your devices.
          </Box>
          <Box
            css={{
              mb: 40,
              padding: '10px',
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <GetStartedButton />
          </Box>
        </VStack>
        <LandingSectionsContainer />
      </VStack>
      <LandingFooter />
    </>
  )
}
