import { OmnivoreNameLogo } from '../../elements/images/OmnivoreNameLogo';
import Link from 'next/link'
import Image from 'next/image'
import { Box, HStack } from '../../elements/LayoutPrimitives';
import { GithubLogo, DiscordLogo, TwitterLogo } from 'phosphor-react'

const containerStyles = {
  padding: '5vw',
  background: '#252525',
  py: 60,
  pb: 105,
  width: '100%',
  '@md': {
    paddingLeft: '6vw',
  },
  '@xl': {
    paddingLeft: '140px',
  }
}

const titleStyles = {
  maxWidth: 330,
  fontWeight: 'normal',
  fontSize: 18,
  lineHeight: '27px',
  color: '#FFFFFF',
  mb: 45,
  '@mdDown': {
    fontSize: '3vw'
  }
}

const socialsContainerStyles = {
  maxWidth: 140,
  marginBottom: 79
}

const copyrightStyles = {
  maxWidth: 330,
  fontWeight: 'normal',
  fontSize: 18,
  lineHeight: '27px',
  color: '#5F5E58'
}

const sectionOne = {
  width: '60%'
}
const sectionTwo = {
  width: '40%',
  pt: 10
}

const contactStyles = {
  fontWeight: '700',
  fontSize: 36,
  lineHeight: '39px',
  color: 'white',
  '@mdDown': {
    fontSize: 26,
  }
}
const supportStyles = {
  fontSize: 24,
  lineHeight: '36px',
  color: 'white',
  '@mdDown': {
    fontSize: '3vw'
  }
}

const imageStyles = {
  maxWidth: 190,
  width: '100%',
}

const socialIconContainerStyles = {
  maxWidth: 32,
  maxHeight: 32,
}

export function LandingFooter(): JSX.Element {
  return (
    <HStack css={containerStyles}>
      <Box css={sectionOne}>
        <OmnivoreNameLogo color='white' />
        <Box css={titleStyles}>Everything you read. Safe, organized, and easy to share.</Box>
        <HStack distribution='between' css={socialsContainerStyles}>
          <Box style={socialIconContainerStyles}>
            <Link passHref href="https://twitter.com/OmnivoreApp">
              <a>
                <TwitterLogo width={32} height={32} color='white' />
              </a>
            </Link>
          </Box>
          <Box style={socialIconContainerStyles}>
            <Link passHref href="https://github.com/omnivore-app/omnivore">
              <a>
                <GithubLogo width={32} height={32} color='white' />
              </a>
            </Link>
          </Box>
          <Box style={socialIconContainerStyles}>
            <Link passHref href="https://discord.gg/h2z5rppzz9">
              <a>
                <DiscordLogo width={32} height={32} color='white' />
              </a>
            </Link>
          </Box>
        </HStack>
        <Box css={copyrightStyles}>© 2022 Omnivore</Box>
      </Box>
      <Box css={sectionTwo}>
        <Box css={{height: 215}}>
          <Box style={{marginBottom: 5, ...imageStyles}}>
            <Link passHref href="https://omnivore.app/install/ios">
              <a>
                <Image src='/static/media/appStoreBadge.png' alt='app-store' width={190} height={60} layout='intrinsic'/>
              </a>
            </Link>
          </Box>
          {/* <Box style={imageStyles}>
            <Link passHref href="#">
              <a>
                <Image src='/static/media/googlePlayBadge.png' alt='app-store' width={190} height={60} layout='intrinsic'/>
              </a>
            </Link>
          </Box> */}
        </Box>
        <Box css={contactStyles}>
          Contact
        </Box>
        <Box css={supportStyles}>
          support@omnivore.com
        </Box>
      </Box>
    </HStack>
  )
}
