import React from 'react'
import Link from 'next/link'
import OnboardingLayout2 from '../OnboardingLayout2'
import MobileInstallHelp from '../../elements/MobileInstallHelp'
import ExtensionsInstallHelp from '../../elements/ExtensionsInstallHelp'
import { StyledAnchor } from '../../elements/StyledText'
import { Box } from '../../elements/LayoutPrimitives'

const OnboardingPage2 = () => {
  return (
    <OnboardingLayout2
      pageNumber={2}
      title="Save links to read later"
      subTitle="Save any link to your library using our apps and browser extensions"
      description='Install our apps and browser extensions'
      image={
        <img
          src='/static/images/onboarding/browser-extension.svg'
          alt="Browser Extension"
        />
      }
    >
      <Box css={{
        "@lgDown": {
          marginBottom: 100,
        }
      }}>
        <Box
          css={{
            margin: '27px 0',
            '@lg': {
              border: '1px solid rgba(0, 0, 0, 0.06)',
              boxShadow: '0px 3px 11px rgba(32, 31, 29, 0.04)',
            },
            backgroundColor: 'White',
          }}
        >
          <Box
            css={{
              '@lgDown': {
                boxShadow: '0px 3px 11px rgba(32, 31, 29, 0.04)',
                border: '1px solid rgba(0, 0, 0, 0.06)',
              },
            }}
          >
            <MobileInstallHelp onboarding />
          </Box>
          <Box
            css={{
              '@lgDown': {
                boxShadow: '0px 3px 11px rgba(32, 31, 29, 0.04)',
                border: '1px solid rgba(0, 0, 0, 0.06)',
                marginTop: '8px',
              },
            }}
          >
            <ExtensionsInstallHelp onboarding />
          </Box>
        </Box>
        <Box
          css={{
            '@lg': {
              marginBottom: '20px',
            },
          }}
        >
          <Link passHref href="#">
            <StyledAnchor
              css={{
                fontWeight: '400',
                fontSize: '14px',
                lineHeight: '17.5px',
                color: 'rgba(10, 8, 6, 0.8)',
                textDecoration: 'underline',
              }}
            >
              Email me instructions
            </StyledAnchor>
          </Link>
        </Box>
      </Box>
    </OnboardingLayout2>
  )
}

export default OnboardingPage2
