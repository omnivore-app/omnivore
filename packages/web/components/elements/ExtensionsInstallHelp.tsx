import { useCallback, useState } from 'react'
import {
  Box,
  VStack,
  HStack,
} from './LayoutPrimitives'
import { StyledText } from './StyledText'
import { Button } from './Button'
import {
  Dropdown,
  DropdownOption,
} from './DropdownElements'
import { ChromeIcon } from './images/ChromeIcon'
import { SafariIcon } from './images/SafariIcon'
import { FirefoxIcon } from './images/FirefoxIcon'
import { EdgeIcon } from './images/EdgeIcon'
import { theme } from '../tokens/stitches.config'
import Image from 'next/image'

export default function ExtensionInstallHelp(): JSX.Element {
  return (
    <Box
      css={{
        bg: '$grayBase',
        px: '$1',
        py: '$3',
        height: '100vh',
      }}
    >
      <ExtensionSelector />
    </Box>
  )
}

const extensionDownloadLinks = {
  chrome: 'https://omnivore.app/install/chrome',
  safari: 'https://omnivore.app/install/mac',
  edge: 'https://omnivore.app/install/edge',
  firefox: 'https://omnivore.app/install/firefox',
}

export type Browser = 'chrome' | 'safari' | 'firefox' | 'edge'

const browserInfo = (browser: Browser): { title: string, icon: JSX.Element } => {
  const fillColor = theme.colors.grayText.toString()
  switch (browser) {
    case 'chrome':
      return { title: 'Chrome', icon: <ChromeIcon fillColor={fillColor} /> }
    case 'safari':
      return { title: 'Safari', icon: <SafariIcon fillColor={fillColor} /> }
    case 'firefox':
      return { title: 'FireFox', icon: <FirefoxIcon fillColor={fillColor} /> }
    case 'edge':
      return { title: 'Edge', icon: <EdgeIcon fillColor={fillColor} /> }
  }
}

function ExtensionSelector(): JSX.Element {
  const [browser, setBrowser] = useState<Browser>('chrome')

  const selectBrowser = useCallback(() => {
    window.location.href = extensionDownloadLinks[browser]
  }, [browser])

  return (
    <VStack
      css={{
        bg: '$grayBase',
        px: '$1',
        py: '$3',
        maxWidth: '30em',
      }}
    >
      <StyledText style="boldHeadline">Install Browser Extensions</StyledText>
      <StyledText style="body" css={{ width: '100%' }}>
      Installing the Omnivore browser extension is the best way to save pages to
      Omnivore from your computer. Learn more about the browser extensions <a href="https://omnivore.app/help/saving-links#savingfromyourcomputer">here</a>.
      </StyledText>
      <HStack distribution="center" css={{ width: '100%', mb: '32px', pl: '24px' }}>
        <Image src="/static/media/about/save-article.png" alt="Save articles" width="300"></Image>
      </HStack> 
      <VStack alignment="center" css={{ mb: '32px', width: '100%' }}>
        <Button onClick={selectBrowser} style="ctaDarkYellow" css={{ p: '18px', px: '42px', fontSize: '18px' }}>Download for {browserInfo(browser).title}</Button>
        <Box >
          <Dropdown triggerElement={<StyledText style='captionLink' css={{ fontSize: '12px' }}>Download for a different browser</StyledText>}>
            <DropdownOption onSelect={() => setBrowser('chrome')}>
              <BrowserOption browser="chrome" />
            </DropdownOption>
            <DropdownOption onSelect={() => setBrowser('safari')}>
              <BrowserOption browser="safari" />
            </DropdownOption>
            <DropdownOption onSelect={() => setBrowser('firefox')}>
              <BrowserOption browser="firefox" />
            </DropdownOption>
            <DropdownOption onSelect={() => setBrowser('edge')} hideSeparator>
              <BrowserOption browser="edge" />
            </DropdownOption>
          </Dropdown>
        </Box>
      </VStack>
    </VStack>
  )
}

type BrowserOptionProps = {
  browser: Browser
}

function BrowserOption(props: BrowserOptionProps): JSX.Element {
  const info = browserInfo(props.browser)
  return (
    <HStack alignment="center" distribution="start">
      <Box css={{ m: '$2' }}>{info.icon}</Box>
      <StyledText css={{ m: '$2' }}>
        {info.title}
      </StyledText>
    </HStack>
  )
}
