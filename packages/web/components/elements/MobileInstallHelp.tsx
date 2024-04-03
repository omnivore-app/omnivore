import React from 'react'
import {
  Desktop,
  DeviceTabletSpeaker,
  DeviceMobileCamera,
} from 'phosphor-react'
import { Box, HStack } from '../elements/LayoutPrimitives'
import { StyledText, StyledAnchor } from '../elements/StyledText'

const TooltipStyle = {
  backgroundColor: '#F9D354',
  color: '#0A0806',
}

type MobileInstallHelpProps = {
  onboarding?: boolean
}

export default function MobileInstallHelp({
  onboarding = false,
}: MobileInstallHelpProps): JSX.Element {
  const [selectedTooltip, setSelectedTooltip] =
    React.useState<string>('Available for Mac')
  const platformSizes = [
    {
      label: 'Available for Mac',
      icon: <Desktop color="#F9D354" />,
    },
    {
      label: 'Available for iPad',
      icon: <DeviceTabletSpeaker color="#F9D354" />,
    },
    {
      label: 'Available for iPhone',
      icon: <DeviceMobileCamera color="#F9D354" />,
    },
  ]

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
        With the Omnivore for iOS and macOS app installed you can save any link
        using our Share extension.
        <br />
        {!onboarding && (
          <StyledAnchor
            href="https://docs.omnivore.app/using/saving.html"
            target="_blank"
            rel="noreferrer"
            css={{
              color: '$grayTextContrast',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'underline',
            }}
          >
            Learn more about the iOS and macOS app -&gt;
          </StyledAnchor>
        )}
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
        >
          {platformSizes.map((item, idx) => (
            <Box
              key={`platformSize-${idx}`}
              title={item.label}
              css={{
                ml: '$1',
              }}
            >
              <StyledAnchor
                onClick={() => setSelectedTooltip(item.label)}
                css={{
                  mx: 'auto',
                  borderRadius: '50%',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 35,
                  width: 35,
                  cursor: 'pointer',
                  backgroundColor: '$labelButtonsBg',
                  ...(selectedTooltip !== item.label && {
                    filter: 'grayscale(1)',
                  }),
                  '&:focus': {
                    filter: 'grayscale(0)',
                  },
                  '&:active': {
                    filter: 'grayscale(0)',
                  },
                  '@lg': {
                    transition: 'filter .3s linear',
                    '&:hover': {
                      filter: 'grayscale(0)',
                    },
                  },
                }}
              >
                {item.icon}
              </StyledAnchor>
            </Box>
          ))}
        </HStack>
      </HStack>
    </Box>
  )
}
