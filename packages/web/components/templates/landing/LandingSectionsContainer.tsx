import Link from 'next/link'
import { VStack, Box } from '../../elements/LayoutPrimitives'
import { Button } from '../../elements/Button'
import { ArrowRight } from 'phosphor-react'
import { LandingSection } from './LandingSection'

const buttonStyles = {
  display: 'flex',
  borderRadius: 4,
  px: 30,
  background: 'rgb(255, 210, 52)',
  color: '#3D3D3D',
}

const arrowStyles = {
  marginLeft: 10,
  padding: 2,
}

export function GetStartedButton(): JSX.Element {
  return (
    <Button style="ctaDarkYellow" css={buttonStyles}>
      <Link passHref href="/login">
        <a style={{ textDecoration: 'none', color: '#3D3D3D' }}>
          Sign Up for Free
        </a>
      </Link>
      <ArrowRight
        size={18}
        width={18}
        height={18}
        style={arrowStyles}
        color="black"
        fontWeight="800"
      />
    </Button>
  )
}

const containerStyles = {
  px: '2vw',
  pt: 32,
  pb: 100,
  width: '100%',
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

const reversedSectionStyles = {
  flexDirection: 'row-reverse',
  marginBottom: 20,
  '@mdDown': {
    width: '100%',
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
  lineHeight: '70px',
  textAlign: 'center',
  padding: '20px',
}

type LandingSectionsContainerProps = {
  hideFirst?: boolean
  hideSecond?: boolean
  hideThird?: boolean
  hideFourth?: boolean
}

export function LandingSectionsContainer({
  hideFirst = false,
  hideSecond = false,
  hideThird = false,
  hideFourth = false,
}: LandingSectionsContainerProps): JSX.Element {
  // const iconColor = 'rgb(255, 210, 52)'
  return (
    <VStack alignment="center" distribution="start" css={containerStyles}>
      <Box
        css={{
          display: 'flex',
          justifyContent: 'center',
          // margin: '40px',
          '@mdDown': {
            margin: '0 0 10px 0',
          },
        }}
      >
        <img
          srcSet="/static/landing/landingPage-1.png"
          alt="landingHero-1"
          style={{
            width: '70%',
            maxWidth: '70%',
          }}
        />
      </Box>

      {!hideFirst && (
        <LandingSection
          titleText="Unclutter your reading."
          descriptionText={
            <p>
              Omnivore strips away the ads, trackers, and clutter and formats
              pages for easy reading without distractions. The text-focused view
              also makes articles smaller and quicker to load.
            </p>
          }
          image={
            <img
              srcSet="/static/landing/landingPage-2.png"
              alt="landing-2"
              style={{ maxHeight: 400 }}
            />
          }
        />
      )}
      {!hideSecond && (
        <LandingSection
          titleText="Save links from anywhere. Forever."
          descriptionText={
            <>
              <p>
                With the Omnivore app for iOS and Android and extensions for all
                major web browsers, you can add to your reading list any time.
              </p>
              <p>
                Saved articles remain in your Omnivore library forever — even if
                the site where you found them goes away. Access them any time in
                our reader view or in their original format.
              </p>
            </>
          }
          image={
            <img
              srcSet="/static/landing/landingPage-3.png"
              alt="landing-3"
              style={{ width: '100%' }}
            />
          }
          containerStyles={reversedSectionStyles}
        />
      )}
      {!hideThird && (
        <LandingSection
          titleText="All your newsletters in one place."
          descriptionText={
            <p>
              Send subscriptions directly to your Omnivore library, and read
              them on your own time, away from the constant distractions and
              interruptions of your email inbox.
            </p>
          }
          image={
            <img
              srcSet="/static/landing/landingPage-4.png"
              alt="landing-4"
              style={{ maxHeight: 400, width: '100%' }}
            />
          }
        />
      )}
      {!hideFourth && (
        <LandingSection
          titleText="Stay organized and in control."
          descriptionText={
            <p>
              Read what you want, not what some algorithm says you should. Keep
              your reading organized and easily available with labels, filters,
              and fully indexed text searches.
            </p>
          }
          image={
            <img
              srcSet="/static/landing/landingPage-5.png"
              alt="landing-5"
              style={{ maxHeight: 400 }}
            />
          }
          containerStyles={reversedSectionStyles}
        />
      )}
      <LandingSection
        titleText="Built for advanced users."
        descriptionText={
          <p>
            The intuitive command palette puts basic and advanced functionality
            at your fingertips. Keyboard shortcuts for all features mean your
            hands never have to leave the keyboard. Our open-source app allows
            integrations with knowledge bases and note-taking apps, using
            plug-ins or by triggering webhooks.
          </p>
        }
        image={
          <img
            srcSet="/static/landing/landingPage-6.png"
            alt="landing-6"
            style={{ width: '100%' }}
          />
        }
      />
      <LandingSection
        titleText="Listen to what you're reading."
        descriptionText={
          <p>
            Lorem IpsumRead what you want, not what some algorithm says you
            should. Keep your reading organized and easily available with
            labels, filters, and fully indexed text searches.
          </p>
        }
        image={
          <img
            srcSet="/static/landing/landingPage-7.png"
            alt="landing-7"
            style={{ maxHeight: 400, width: '100%' }}
          />
        }
        containerStyles={reversedSectionStyles}
      />
      <VStack alignment="center" css={callToActionStyles}>
        <Box css={callToActionText}>Get Started With Omnivore Today</Box>
        <GetStartedButton />
      </VStack>
    </VStack>
  )
}
