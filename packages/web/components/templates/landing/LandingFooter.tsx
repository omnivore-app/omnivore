import { Box, HStack, VStack } from '../../elements/LayoutPrimitives'
import { styled } from '../../tokens/stitches.config'
import { StyledText } from '../../elements/StyledText'

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
  },
}

export function LandingFooter(): JSX.Element {
  const FooterList = styled('ul', {
    listStyle: 'none',
    paddingLeft: '0',
    li: {
      pt: '15px',
    },
    a: {
      color: '$omnivoreCtaYellow',
      textDecoration: 'none',
      '&:hover': {
        textDecoration: 'underline',
      },
    },
    '@mdDown': {
      columns: 2,
      width: '100%',
      marginTop: "8px",
      marginBottom: "30px",
    },
  })

  return (
    <HStack css={containerStyles}>
      <Box
        css={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          maxWidth: '1024px',
          '@md': {
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
          },
        }}
      >
        <VStack>
          <StyledText style="aboutFooter">Install</StyledText>
          <FooterList>
            <li>
              <a href="https://omnivore.app/install/ios">iOS</a>
            </li>
            <li>
              <a href="https://omnivore.app/install/macos">macOS</a>
            </li>
            <li>
              <a href="https://omnivore.app/install/android">
                Android (preview release)
              </a>
            </li>
            <li>
              <a href="https://omnivore.app/install/chrome">Chrome Extension</a>
            </li>
            <li>
              <a href="https://omnivore.app/install/firefox">
                Firefox Extension
              </a>
            </li>
            <li>
              <a href="https://omnivore.app/install/safari">Safari Extension</a>
            </li>
            <li>
              <a href="https://omnivore.app/install/edge">Edge Extension</a>
            </li>
          </FooterList>
        </VStack>
        <VStack>
          <StyledText style="aboutFooter">About</StyledText>
          <FooterList>
            <li>
              <a href="https://docs.omnivore.app/about/pricing">Pricing</a>
            </li>
            <li>
              <a href="https://docs.omnivore.app/about/privacy-statement">
                Privacy
              </a>
            </li>
            <li>
              <a href="mailto:feedback@omnivore.app">Contact&nbsp;us via&nbsp;email</a>
            </li>
            <li>
              <a href="https://discord.gg/h2z5rppzz9">
                Join our community on Discord
              </a>
            </li>
            <li>
              <a href="https://github.com/omnivore-app/omnivore/blob/main/SECURITY.md">
                Security
              </a>
            </li>
            <li>
              <a href="https://docs.omnivore.app">Read our Docs</a>
            </li>
          </FooterList>
        </VStack>

        <VStack>
          <StyledText style="aboutFooter">Follow</StyledText>
          <FooterList>
            <li>
              <a href="https://twitter.com/OmnivoreApp">Twitter</a>
            </li>
            <li>
              <a href="https://pkm.social/@omnivore">Mastodon</a>
            </li>
            <li>
              <a href="https://blog.omnivore.app">Blog</a>
            </li>
            <li>
              <a href="https://github.com/omnivore-app/omnivore">GitHub</a>
            </li>
          </FooterList>
        </VStack>
      </Box>
    </HStack>
  )
}
