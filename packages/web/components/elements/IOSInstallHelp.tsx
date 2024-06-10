import React from 'react'
import {
  Desktop,
  DeviceTabletSpeaker,
  DeviceMobileCamera,
} from '@phosphor-icons/react'
import { Box, HStack } from './LayoutPrimitives'
import { StyledText, StyledAnchor } from './StyledText'

type MobileInstallHelpProps = {
  onboarding?: boolean
}

export default function IOSInstallHelp({
  onboarding = false,
}: MobileInstallHelpProps): JSX.Element {
  const iosContainerStyles = {
    marginTop: '12px',
    width: '100%',
    height: '40px',
    display: 'flex',
    justifyContent: !onboarding ? 'flex-end' : 'initial',
  }

  return (
    <Box
      css={{
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
        gridTemplateRows: !onboarding ? '.5fr .5fr .5fr' : '.5fr',
        backgroundColor: '$grayBg',
        padding: '15px',
        '@lg': {
          marginTop: '0',
          paddingTop: '0',
          gridTemplateColumns: '1fr 2fr 1fr',
          gridTemplateRows: '1fr',
          height: '9rem',
        },
      }}
    >
      <Box
        css={{
          gridColumn: 1 / 2,
          gridRow: 1 / 2,
          marginRight: '$3',
          minWidth: '170px',
          maxWidth: '200px',
          alignSelf: 'center',
          '@lg': {
            minWidth: '200px',
            gridColumn: '1',
            gridRow: '1',
          },
          backgroundColor: '$grayBase',
          display: 'flex',
          position: 'relative',
          height: '116px',
        }}
      >
        <Box
          css={{
            position: 'absolute',
            top: '-15px',
          }}
        >
          <img
            srcSet="/static/images/mobile-app-preview.png,
             /static/images/mobile-app-preview@2x.png 2x"
          />
        </Box>
      </Box>
      <Box
        css={{
          gridColumn: '2',
          gridRow: '1',
          display: 'flex',
          flexDirection: 'column',
          '@lg': {
            marginTop: '16px',
          },
        }}
      >
        <StyledText
          as={'h3'}
          css={{
            fontSize: '18px',
            fontWeight: 700,
            marginTop: 0,
            marginBottom: 0,
            color: !onboarding ? '$grayTextContrast' : 'rgba(10, 8, 6, 0.8)',
            lineHeight: '22.5px',
            '@lg': {
              fontSize: '16px',
              lineHeight: '20px',
            },
          }}
        >
          Install Omnivore for iOS and macOS
        </StyledText>
      </Box>
      <StyledText
        css={{
          size: '14px',
          my: '$2',
          fontWeight: 400,
          color: !onboarding ? '$grayTextContrast' : 'rgba(10, 8, 6, 0.8)',
          maxWidth: '20rem',
          lineHeight: '21px',
          gridColumn: '1 / span 3',
          gridRow: '2 / 3',
          alignSelf: 'center',
          '@lgDown': {
            display: !onboarding ? 'initial' : 'none',
          },
          '@lg': {
            gridColumn: '2',
            gridRow: '1',
            alignSelf: 'center',
            marginTop: !onboarding ? '$4' : 65,
          },
        }}
      >
        With the native Omnivore for iOS and macOS app installed you can save
        any link, read offline, and listen to your saved items using
        text-to-speech.
      </StyledText>
      <HStack
        alignment="center"
        css={{
          gridRow: '3',
          display: 'flex',
          alignItems: 'center',
          gridColumn: '1 / span 2',
          flexDirection: !onboarding ? 'row-reverse' : 'inherit',
          justifyContent: !onboarding ? 'space-between' : 'center',
          mt: !onboarding ? 'inherit' : 10,
          '@lg': {
            flexDirection: !onboarding ? 'row-reverse' : 'column-reverse',
            alignItems: !onboarding ? 'center' : 'flex-end',
            gridColumn: '3',
            gridRow: '1',
          },
        }}
      >
        <Box
          css={
            !onboarding
              ? { ...iosContainerStyles, '@lg': { pl: '16px' } }
              : {
                  ...iosContainerStyles,
                  pl: 16,
                  '@lg': {
                    marginTop: '24px',
                    justifyContent: 'flex-end',
                  },
                }
          }
        >
          <a
            href="https://omnivore.app/install/ios"
            target="_blank"
            rel="noreferrer"
            style={{ display: 'inlineBlock', overflow: 'hidden' }}
          >
            <img
              src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us?size=90x37&amp;releaseDate=1628121600&h=2bbc629b0455dbea136257c9f518e4b3"
              alt="Download on the App Store"
              style={{}}
            />
          </a>
        </Box>
        <HStack
          css={
            !onboarding
              ? {
                  width: '40%',
                  justifyContent: 'space-between',
                  maxWidth: '13rem',
                  visibility: 'collapse',
                  '@lg': {
                    width: '100%',
                    visibility: 'unset',
                  },
                }
              : {
                  width: '40%',
                  justifyContent: 'space-between',
                  maxWidth: '13rem',
                  visibility: 'unset',
                  '@lg': {
                    width: '146px',
                    // maxWidth: '210px'
                  },
                }
          }
        ></HStack>
      </HStack>
    </Box>
  )
}
