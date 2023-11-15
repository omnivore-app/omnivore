import React from 'react'
import { Box, HStack } from '../elements/LayoutPrimitives'
import { StyledText, StyledAnchor } from '../elements/StyledText'
import { AngleDownIcon } from '../tokens/icons/AngleDownIcon'
import { Button } from './Button'
import { Dropdown, DropdownOption, DropdownSeparator } from './DropdownElements'
import { ChromeIcon } from './images/ChromeIcon'
import { EdgeIcon } from './images/EdgeIcon'
import { FirefoxIcon } from './images/FirefoxIcon'
import { SafariIcon } from './images/SafariIcon'
import Link from 'next/link'

const icons = {
  'Google Chrome': <ChromeIcon />,
  'Microsoft Edge': <EdgeIcon />,
  Firefox: <FirefoxIcon />,
  Safari: <SafariIcon />,
}

const extensionDownloadLinks = {
  'Google Chrome': 'https://omnivore.app/install/chrome',
  Safari: 'https://omnivore.app/install/mac',
  'Microsoft Edge': 'https://omnivore.app/install/edge',
  Firefox: 'https://omnivore.app/install/firefox',
}

const browserOptions = [
  'Google Chrome',
  'Firefox',
  'Microsoft Edge',
  'Safari',
] as const

type browserType = typeof browserOptions[number]

const BrowserOption: React.FC<{
  browser: browserType
}> = ({ browser }) => {
  return (
    <HStack
      css={{
        justifyContent: 'flex-start',
        alignItems: 'center',
        minWidth: 165,
        cursor: 'pointer',
      }}
    >
      <Box css={{ mr: '$3' }}>{icons[browser as browserType]}</Box>
      <StyledText
        css={{
          whiteSpace: 'nowrap',
          fontSize: '12px',
          my: '0',
        }}
      >
        {browser}
      </StyledText>
    </HStack>
  )
}

type ExtensionsInstallHelpProps = {
  onboarding?: boolean
}

export default function ExtensionsInstallHelp({
  onboarding = false,
}: ExtensionsInstallHelpProps): JSX.Element {
  const [browserValue, setBrowserValue] = React.useState<browserType>(
    browserOptions[0]
  )

  return (
    <Box
      css={{
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
        gridTemplateRows: !onboarding ? '.5fr .5fr .5fr' : '.5fr',
        backgroundColor: '$grayBg',
        padding: '15px',
        '@lg': {
          gridTemplateColumns: '1fr 2fr 1fr',
          gridTemplateRows: '1fr',
          height: !onboarding ? '9rem' : 'auto',
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
            height: '130px',
          }}
        >
          <img src="/static/images/extension-preview.svg" />
        </Box>
      </Box>
      <Box
        css={{
          gridColumn: '2',
          gridRow: '1',
          display: 'flex',
          flexDirection: 'column',
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
          Install Browser Extensions
        </StyledText>
      </Box>
      <StyledText
        css={{
          size: '14px',
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
          },
        }}
      >
        Installing the Omnivore browser extension is the best way to save pages
        to Omnivore from your computer.
        <br />
        {!onboarding && (
          <StyledAnchor
            css={{
              color: '$grayTextContrast',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'underline',
            }}
            href="https://docs.omnivore.app/using/saving.html"
            target="_blank"
            rel="noreferrer"
          >
            Learn more about the browser extension -&gt;
          </StyledAnchor>
        )}
      </StyledText>
      <HStack
        css={{
          gridRow: '3',
          display: 'flex',
          alignItems: 'center',
          gridColumn: '1 / span 2',
          width: '100%',
          justifyContent: 'space-between',
          flexDirection: 'row',
          mt: '10px',
          '@lg': {
            gridColumn: '3',
            gridRow: '1',
            flexDirection: !onboarding ? 'row' : 'column',
            justifyContent: !onboarding ? 'space-between' : 'center',
          },
        }}
      >
        <Dropdown
          triggerElement={
            <HStack
              css={{
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1px 4px',
                borderRadius: '6px',
                height: '38px',
                border: '1px solid #F9D354',
                '@lg': {
                  width: !onboarding ? '190px' : '210px',
                },
              }}
            >
              <Box
                css={{
                  ml: '$2',
                  mr: '$1',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {icons[browserValue]}
                <StyledText
                  css={{
                    whiteSpace: 'nowrap',
                    marginLeft: '$3',
                  }}
                >
                  {browserValue}
                </StyledText>
              </Box>
              <Box
                css={{
                  mx: '$1',
                }}
              >
                <AngleDownIcon height={10} width={20} />
              </Box>
            </HStack>
          }
        >
          {browserOptions.map((item, idx) => (
            <div key={`browserOptions${idx}`}>
              <DropdownOption key={idx} onSelect={() => setBrowserValue(item)}>
                <BrowserOption browser={item} />
              </DropdownOption>
              {idx !== browserOptions.length - 1 && (
                <DropdownSeparator
                  css={{
                    height: '1px',
                    backgroundColor: '$grayBorder',
                  }}
                />
              )}
            </div>
          ))}
        </Dropdown>
        <Button
          as="a"
          target="_blank"
          href={extensionDownloadLinks[browserValue]}
          css={{
            marginLeft: !onboarding ? '8px' : '0px',
            marginTop: !onboarding ? '0px' : '8px',
            height: 'min-content',
            textDecoration: 'none',
            width: !onboarding ? '100%' : '210px',
            color: 'rgba(10, 8, 6, 0.8)',
            textAlign: 'center',
            '@lgDown': {
              width: '27vw',
            },
          }}
          style="ctaDarkYellow"
        >
          Download
        </Button>
      </HStack>
    </Box>
  )
}
