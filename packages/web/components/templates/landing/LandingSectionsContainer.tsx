import Link from 'next/link'
import { VStack, Box, SpanBox } from '../../elements/LayoutPrimitives'
import { CurvedUnderlineIcon } from '../../elements/images/CurvedUnderlineIcon'
import { Button } from '../../elements/Button'
import {
  MagnifyingGlass,
  Palette,
  EnvelopeSimple,
  FloppyDisk,
  ArrowRight,
} from 'phosphor-react'
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
        <a style={{ textDecoration: 'none', color: '#3D3D3D' }}>Sign Up</a>
      </Link>
      <ArrowRight
        size={18}
        width={18}
        height={18}
        style={arrowStyles}
        color="white"
        fontWeight="700"
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

const titleStyles = {
  fontWeight: '600',
  fontSize: '24',
  textAlign: 'center',
  lineHeight: '36px',
  color: '#FF9B3E',
  '@mdDown': {
    fontSize: 16,
    letterSpacing: '0.02em',
  },
}

const subTitleText = {
  fontSize: 64,
  maxWidth: 590,
  fontWeight: '700',
  textAlign: 'center',
  lineHeight: '70px',
  mb: 30,
  '@mdDown': {
    maxWidth: 295,
    fontSize: 32,
    lineHeight: '40px',
  },
}

const reversedSectionStyles = {
  flexDirection: 'row-reverse',
  marginBottom: 20,
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
  height: 330,
  '@mdDown': {
    display: 'none',
  },
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
  maxWidth: 500,
}

const underlineIconStyles = {
  height: '5px',
  alignSelf: 'normal',
  position: 'relative',
  bottom: 20,
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
  const iconColor = 'rgb(255, 210, 52)'
  return (
    <VStack alignment="center" distribution="start" css={containerStyles}>
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
              srcSet="/static/landing/landing-1.png, /static/landing/landing-1@2x.png 2x"
              alt="landing-1"
              style={{ height: '50vw', maxHeight: 560 }}
              sizes="auto 50vw, auto 50vw"
            />
          }
          icon={
            <MagnifyingGlass size={32} color={iconColor} weight="duotone" />
          }
        />
      )}
      {!hideSecond && (
        <LandingSection
          titleText="Go ahead, mark it up."
          descriptionText={
            <>
              <p>
                Read actively, not passively. Highlight key sections and add
                notes as you read. You can access your highlights and notes any
                time — they stay with your articles forever.
              </p>
              <p>
                Fun fact: research shows that highlighting while you read
                improves retention and makes you a more effective reader.
              </p>
            </>
          }
          image={
            <img
              srcSet="/static/landing/landing-2.png, /static/landing/landing-2@2x.png 2x"
              alt="landing-2"
              style={{ width: '100%', marginRight: 40 }}
              sizes="auto 50vw, auto 50vw"
            />
          }
          icon={<Palette size={32} color={iconColor} weight="duotone" />}
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
              srcSet="/static/landing/landing-4.png, /static/landing/landing-4@2x.png 2x"
              alt="landing-3"
              style={{ height: '38vw', maxHeight: 480 }}
              sizes="auto 50vw, auto 50vw"
            />
          }
          icon={<EnvelopeSimple size={32} color={iconColor} weight="duotone" />}
        />
      )}
      {!hideFourth && (
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
              srcSet="/static/landing/landing-3.png, /static/landing/landing-3@2x.png 2x"
              alt="landing-4"
              style={{ width: '100%', marginRight: 40 }}
              sizes="auto 50vw, auto 50vw"
            />
          }
          icon={<FloppyDisk size={32} color={iconColor} weight="duotone" />}
          containerStyles={reversedSectionStyles}
        />
      )}
      <VStack alignment="center" css={callToActionStyles}>
        <Box css={callToActionText}>Sign up for free</Box>
        <GetStartedButton />
      </VStack>
    </VStack>
  )
}
