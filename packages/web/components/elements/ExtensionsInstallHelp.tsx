import React from 'react'
import { Box, HStack } from '../elements/LayoutPrimitives'
import { StyledImg, StyledText } from '../elements/StyledText'
import { AngleDownIcon } from '../tokens/icons/AngleDownIcon'
import { Button } from './Button'
import { Dropdown, DropdownOption, DropdownSeparator } from './DropdownElements'
import { ChromeIcon } from './images/ChromeIcon'
import { EdgeIcon } from './images/EdgeIcon'
import { FirefoxIcon } from './images/FirefoxIcon'
import { SafariIcon } from './images/SafariIcon'

const icons = {
  'Google Chrome': <ChromeIcon />,
  'Microsoft Edge': <EdgeIcon />,
  Firefox: <FirefoxIcon />,
  Safari: <SafariIcon />,
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

export default function ExtensionsInstallHelp(): JSX.Element {
  const [browserValue, setBrowserValue] = React.useState<browserType>(
    browserOptions[0]
  )
  const handleBrowserUpdate = (e: any) => {
    setBrowserValue(e)
  }
  return (
    <Box
      css={{
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
        gridTemplateRows: '.5fr .5fr .5fr',
        backgroundColor: '$grayBg',
        padding: '15px',
        '@md': {
          gridTemplateColumns: '1fr 2fr 1fr',
          gridTemplateRows: '1fr',
          height: '9rem',
        },
      }}
    >
      <StyledImg
        css={{
          gridColumn: 1 / 2,
          gridRow: 1 / 2,
          width: 146,
          marginRight: '$3',
          '@md': {
            width: 211,
            gridColumn: '1',
            gridRow: '1',
          },
        }}
        src="/static/media/about/save-article.png"
        alt="Save articles"
      />
      <Box
        css={{
          gridColumn: '2',
          gridRow: '1',
          '@md': {
            marginTop: '$3',
          },
        }}
      >
        <StyledText
          css={{
            fontWeight: '600',
            fontSize: '12px',
            lineHeight: '18px',
            textAlign: 'right',
            color: '$grayTextContrast',
            '@md': {
              display: 'none',
            },
          }}
        >
          Learn more
        </StyledText>
        <StyledText
          as={'h3'}
          css={{
            fontSize: '18px',
            fontWeight: 700,
            marginTop: 0,
            marginBottom: 0,
            color: '$grayTextContrast',
            lineHeight: '22.5px',
            '@md': {
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
          color: '$grayTextContrast',
          maxWidth: '20rem',
          lineHeight: '21px',
          gridColumn: '1 / span 3',
          gridRow: '2 / 3',
          alignSelf: 'center',
          '@md': {
            gridColumn: '2',
            gridRow: '1',
            alignSelf: 'center',
            marginTop: '$4',
          },
        }}
      >
        Installing the Omnivore browser extension is the best way to save pages
        to Omnivore from your computer.
        <br />
        <StyledText
          // as={Link}
          css={{
            color: '$grayTextContrast',
            fontSize: '14px',
            fontWeight: 600,
            display: 'none',
            '@md': {
              display: 'initial',
              textDecoration: 'underline',
            },
          }}
          // href="/"
        >
          Learn more about the browser extension here.
        </StyledText>
      </StyledText>
      <HStack
        css={{
          gridRow: '3',
          display: 'flex',
          alignItems: 'center',
          gridColumn: '1 / span 2',
          width: '100%',
          justifyContent: 'space-between',
          '@md': {
            gridColumn: '3',
            gridRow: '1',
          },
        }}
      >
        <Dropdown
          showArrow={false}
          triggerElement={
            <HStack
              css={{
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1px 4px',
                borderRadius: '6px',
                height: '38px',
                border: '1px solid #F9D354',
                width: '60vw',
                '@md': {
                  width: '190px',
                  boxShadow: '$cardBoxShadow',
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
          css={{
            marginLeft: '8px',
            height: 'min-content',
            '@mdDown': {
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
