import { VStack, Box } from '../elements/LayoutPrimitives'
import { LandingHeader } from './landing/LandingHeader'
import {
  GetStartedButton,
  LandingSectionsContainer,
} from './landing/LandingSectionsContainer'
import { LandingFooter } from './landing/LandingFooter'

export function About(): JSX.Element {
  return (
    <>
      <LandingHeader />
      <VStack
        alignment="center"
        css={{ background: '#FEFCF5', color: '#3D3D3D' }}
      >
        <VStack
          css={{
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
          }}
        >
          <Box
            css={{
              fontWeight: '700',
              color: '#3D3D3D',
              fontSize: 45,
              lineHeight: '53px',
              padding: '10px',
              paddingBottom: '0px',
              textAlign: 'center',
            }}
          >
            Omnivore is the free, open source, read-it-later app for serious
            readers.
          </Box>
          <Box
            css={{
              color: 'rgb(125, 125, 125)',
              padding: '10px',
              textAlign: 'center',
              width: '100%',
              fontWeight: '600',
            }}
          >
            Distraction free. Privacy focused. Open source. Designed for
            knowledge workers and lifelong learners.
          </Box>

          <Box
            css={{
              color: 'rgb(125, 125, 125)',
              padding: '10px',
              textAlign: 'center',
            }}
          >
            Save articles, newsletters, and documents and read them later —
            focused and distraction free. Add notes and highlights. Organize
            your reading list the way you want and sync it across all your
            devices.
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
