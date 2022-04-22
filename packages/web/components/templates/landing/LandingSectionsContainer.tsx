import Link from 'next/link'
import { VStack, Box, SpanBox } from '../../elements/LayoutPrimitives'
import { CurvedUnderlineIcon } from '../../elements/images/CurvedUnderlineIcon'
import { Button } from '../../elements/Button'
import { MagnifyingGlass, Palette, MegaphoneSimple, Binoculars, ArrowRight } from 'phosphor-react'
import { LandingSection } from './LandingSection'

const buttonStyles = {
  display: 'flex',
  borderRadius: 4,
  px: 30,
  background: 'rgb(255, 210, 52)',
  color: '#3D3D3D'
}

const arrowStyles = {
  marginLeft: 10, 
  padding: 2,
}

export function GetStartedButton(): JSX.Element {
  return (
    <Button style='ctaDarkYellow' css={buttonStyles}>
      <Link passHref href='/login'>
        <a style={{textDecoration: 'none', color: '#3D3D3D'}}>
          Get Started
        </a>
      </Link>
      <ArrowRight size={18} width={18} height={18} style={arrowStyles} color='white' fontWeight='700' />
    </Button>
  )
}

const containerStyles = {
  px: '2vw',
  pt: 100,
  pb: 100,
  width: '100%',
  background: 'linear-gradient(0deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.2)), linear-gradient(0deg, rgba(253, 250, 236, 0.7), rgba(253, 250, 236, 0.7))',
  '@mdDown': {
    pt: 50,
  },
  '@md': {
    px: '6vw',
  },
  '@xl': {
    px: '100px',
  }
}

const titleStyles = {
  fontWeight: '600',
  fontSize: '24',
  textAlign: 'center',
  lineHeight: '36px',
  color: '#FF9B3E',
  '@mdDown': {
    fontSize: 16,
    letterSpacing: '0.02em'
  }
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
  }
}

const reversedSectionStyles = {
  flexDirection: 'row-reverse',
  marginBottom: 20
}

const callToActionStyles = {
  background: 'white',
  borderRadius: '24px',
  boxSizing: 'border-box',
  border: '1px solid #D8D7D5',
  boxShadow: '0px 7px 8px rgba(32, 31, 29, 0.03), 0px 18px 24px rgba(32, 31, 29, 0.03)',
  padding: 40,
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
  maxWidth: 500
}

const underlineIconStyles = {
  height: '5px',
  alignSelf: 'normal',
  position: 'relative',
  bottom: 20,
}

type LandingSectionsContainerProps = {
  hideFirst?: boolean,
  hideSecond?: boolean,
  hideThird?: boolean,
  hideFourth?: boolean,
}

export function LandingSectionsContainer({
  hideFirst = false,
  hideSecond = false,
  hideThird = true,
  hideFourth = true,
}: LandingSectionsContainerProps): JSX.Element {
  const iconColor = 'rgb(255, 210, 52)'
  return (
    <VStack alignment='center' distribution='start' css={containerStyles}>
      <VStack distribution='center'>
        <Box css={titleStyles}>
          This is Omnivore
        </Box>
        <SpanBox css={underlineIconStyles}>
          <CurvedUnderlineIcon />
        </SpanBox>
      </VStack>
      <Box css={subTitleText}>
        Collect and share the best of the web
      </Box>
      {!hideFirst && (
        <LandingSection
          titleText='Simply reader-friendly'
          descriptionText='With a single click using Omnivore’s extension or mobile app, save any link you come across on the Internet. Your links are saved forever, so you will never lose anything. We also strip out the unnecessary content to give you a reader-friendly view of your saved pages.'
          image={
            <img
              srcSet="/static/landing/landing-1.png, /static/landing/landing-1@2x.png 2x"
              alt='landing-1'
              style={{height: '50vw', maxHeight: 560}}
              sizes="auto 50vw, auto 50vw"
            />
          }
          icon={<MagnifyingGlass size={32} color={iconColor} weight='duotone' />}
        />
      )}
      {!hideSecond && (
        <LandingSection
          titleText='Make it your own'
          descriptionText='Curate your own personal collection of saved links and annotate these links with your thoughts. Omnivore lets you highlight any text you find inspiring and attach personal notes to these highlights.'
          image={
            <img
              srcSet="/static/landing/landing-2.png, /static/landing/landing-2@2x.png 2x"
              alt='landing-2'
              style={{width: '100%', marginRight: 40}}
              sizes="auto 50vw, auto 50vw"
            />
          }
          icon={<Palette size={32} color={iconColor} weight='duotone' />}
          containerStyles={reversedSectionStyles}
        />  
      )}
      {!hideThird && (
        <LandingSection
          titleText='A better way to share'
          descriptionText='With Omnivore’s highlight and notes feature, you can share specific snippets from a link with your friends. Our share feature is integrated with top social media sites so sharing with your friends is just one click away.'
          image={
            <img
              srcSet="/static/landing/landing-3.png, /static/landing/landing-3@2x.png 2x"
              alt='landing-3'
              style={{height: '50vw', maxHeight: 560}}
              sizes="auto 50vw, auto 50vw"
            />
          }
          icon={<MegaphoneSimple size={32} color={iconColor} weight='duotone' />}
        />
      )}
      {!hideFourth && (
        <LandingSection
          titleText='Discover new content'
          descriptionText='Follow friends and people you admire and see what they are reading. With our highlight and notes feature, you can read through the eyes of others and see what others have highlighted and commented.'
          image={
            <img
              srcSet="/static/landing/landing-4.png, /static/landing/landing-4@2x.png 2x"
              alt='landing-4'
              style={{width: '100%', marginRight: 40}}
              sizes="auto 50vw, auto 50vw"
            />
          }
          icon={<Binoculars size={32} color={iconColor} weight='duotone' />}
          containerStyles={reversedSectionStyles}
        />
      )}
      <VStack alignment='center' css={callToActionStyles}>
        <Box css={callToActionText}>
          Get started with Omnivore today
        </Box>
        <GetStartedButton />
      </VStack>
    </VStack>
  )
}
