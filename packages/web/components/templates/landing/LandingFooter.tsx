import { OmnivoreNameLogo } from '../../elements/images/OmnivoreNameLogo';
import { Box, HStack } from '../../elements/LayoutPrimitives';

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
  marginBottom: 77
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
  maxWidth: 180,
  width: '100%',
}

export function LandingFooter(): JSX.Element {
  return (
    <HStack css={containerStyles}>
      <Box css={sectionOne}>
        <OmnivoreNameLogo color='white' />
        <Box css={titleStyles}>Everything you read. Safe, organized, and easy to share.</Box>
        <HStack distribution='between' css={socialsContainerStyles}>
          <a href='#'>
            <img src='/static/media/twitter.png' alt='twitter'/>
          </a>
          <a href='#'>
            <img src='/static/media/github.png' alt='github'/>
          </a>
          <a href='#'>
            <img src='/static/media/discord.png' alt='discord'/>
          </a>
        </HStack>
        <Box css={copyrightStyles}>© 2022 Omnivore</Box>
      </Box>
      <Box css={sectionTwo}>
        <Box css={{height: 215}}>
          <a href='#'>
            <img src='/static/media/appStoreBadge.png' alt='app-store' style={{
              marginBottom: 24,
              ...imageStyles,
            }} />
          </a>
          <br />
          <a href='#'>
            <img src='/static/media/googlePlayBadge.png' alt='play-store' style={imageStyles} />
          </a>
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
