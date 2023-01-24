import { VStack, Box } from '../../elements/LayoutPrimitives'
import { Button } from '../../elements/Button'
import { LandingSection } from './LandingSection'

export function GetStartedButton(): JSX.Element {
  return (
    <Button
      style="ctaDarkYellow"
      css={{
        display: 'flex',
        borderRadius: 4,
        background: 'rgb(255, 210, 52)',
        color: '#3D3D3D',
        width: '172px',
        height: '42px',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '600',
      }}
      onClick={(e) => {
        document.location.href = '/login'
        e.preventDefault()
      }}
    >
      Sign Up for Free
    </Button>
  )
}

const containerStyles = {
  px: '2vw',
  pt: 32,
  pb: 100,
  width: '100%',
  maxWidth: '1224px',
  background:
    'linear-gradient(0deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.2)), linear-gradient(0deg, rgba(253, 250, 236, 0.7), rgba(253, 250, 236, 0.7))',
  '@mdDown': {
    pt: 50,
  },
  '@md': {
    px: '6vw',
  },
  '@xl': {
    px: '100px',
  },
}

const callToActionStyles = {
  background: 'white',
  borderRadius: '24px',
  boxSizing: 'border-box',
  border: '1px solid #D8D7D5',
  boxShadow:
    '0px 7px 8px rgba(32, 31, 29, 0.03), 0px 18px 24px rgba(32, 31, 29, 0.03)',
  padding: 40,
  marginTop: 64,
  minheight: 330,
  width: 'inherit',

  '@md': {
    width: '100%',
  },
  '@xl': {
    width: '95%',
  },
}

const callToActionText = {
  color: '#3D3D3D',
  fontWeight: '700',
  fontSize: 64,
  lineHeight: '1.25',
  textAlign: 'center',
  paddingBottom: '20px',
  '@mdDown': {
    fontSize: '32px',
  },
}

export function LandingSectionsContainer(): JSX.Element {
  return (
    <VStack alignment="center" distribution="start" css={containerStyles}>
      <Box
        css={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '120px',
          '@mdDown': {
            margin: '0 0 10px 0',
          },
        }}
      >
        <img
          height="647"
          width="1015"
          srcSet="/static/landing/landingPage-feature@1x.png,
                  /static/landing/landingPage-feature@2x.png 2x,
                  /static/landing/landingPage-feature@3x.png 3x"
          alt="landingHero-1"
          style={{
            width: '85%',
            height: 'auto',
          }}
        />
      </Box>

      <LandingSection
        titleText="Save it now. Read it later."
        descriptionText={
          <>
            <p>
              Save articles, PDFs, and Twitter threads as you come across them
              using Omnivore's mobile apps and browser extensions. Read them
              later using our distraction free reader.
            </p>
          </>
        }
        image={
          <img
            srcSet="/static/landing/landingPage-03@1x.png,
                      /static/landing/landingPage-03@2x.png,
                      /static/landing/landingPage-03@3x.png 3x"
            alt="landing-3"
            style={{ maxWidth: '100%' }}
          />
        }
      />

      <LandingSection
        titleText="Get all your newsletters in one place."
        descriptionText={
          <p>
            Send newsletters directly to your Omnivore library rather than
            scattered across multiple inboxes. Read them on your own time, away
            from the constant distractions and interruptions of your email.
          </p>
        }
        image={
          <img
            srcSet="/static/landing/landingPage-04.png,
                      /static/landing/landingPage-04@2x.png 2x,
                      /static/landing/landingPage-04@3x.png 3x"
            alt="landing-4"
            style={{ maxWidth: '100%' }}
          />
        }
      />

      <LandingSection
        titleText="Keep your reading organized, whatever that means to you."
        descriptionText={
          <p>
            Keep your reading organized and easily available with labels,
            filters, rules, and fully indexed text searches. We&aposre not here
            to tell you how to stay organized — our job is to give you the tools
            to build a system that works for you.
          </p>
        }
        image={
          <img
            srcSet="/static/landing/landingPage-05@1x.png,
                      /static/landing/landingPage-05@2x.png 2x,
                      /static/landing/landingPage-05@3x.png 3x"
            alt="landing-5"
            style={{ maxWidth: '100%' }}
          />
        }
      />

      <LandingSection
        titleText="Add highlights and notes."
        descriptionText={
          <p>
            Become a better reader — engage your brain and improve retention by
            reading actively, not passively. Highlight key sections and add
            notes as you read. You can access your highlights and notes any time
            — they stay with your articles forever.
          </p>
        }
        image={
          <img
            srcSet="/static/landing/landingPage-06@1x.png,
                      /static/landing/landingPage-06@2x.png 2x,
                      /static/landing/landingPage-06@3x.png 3x"
            alt="landing-5"
            style={{ maxWidth: '100%' }}
          />
        }
      />

      <LandingSection
        titleText="Sync with your second brain."
        descriptionText={
          <p>
            Omnivore syncs with popular Personal Knowledge Management systems
            including Logseq and Obsidian, so you can pull all your saved
            reading, highlights, and notes into your second brain.
          </p>
        }
        image={
          <img
            srcSet="/static/landing/landingPage-07.png,
                    /static/landing/landingPage-07@2x.png 2x,
                    /static/landing/landingPage-07@3x.png 3x"
            alt="landing-6"
            style={{ maxWidth: '100%' }}
          />
        }
      />

      <LandingSection
        titleText="Listen to your reading with text-to-speech."
        descriptionText={
          <p>
            Work through your to-be-read list and give your eyes a break with
            TTS, exclusively in the Omnivore app for iOS. Realistic,
            natural-sounding AI voices will read any saved article aloud.
          </p>
        }
        image={
          <img
            srcSet="/static/landing/landingPage-08.png,
            /static/landing/landingPage-08@2x.png 2x,
            /static/landing/landingPage-08@3x.png 3x"
            alt="landing-7"
            style={{ maxWidth: '85%' }}
          />
        }
      />

      <VStack alignment="center" css={callToActionStyles}>
        <Box css={callToActionText}>Get Started With Omnivore Today</Box>
        <GetStartedButton />
      </VStack>
    </VStack>
  )
}
