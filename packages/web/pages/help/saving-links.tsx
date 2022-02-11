/* eslint-disable @next/next/no-img-element */
import { Box, HStack } from '../../components/elements/LayoutPrimitives'
import { PrimaryLayout } from '../../components/templates/PrimaryLayout'
import { Button } from '../../components/elements/Button'
import Link from 'next/link'

export default function Colors(): JSX.Element {
  return (
    <PrimaryLayout
      pageMetaDataProps={{
        title: 'Saving Links to Omnivore',
        path: '/help/saving-links',
      }}
      pageTestId="help-saving-links-page-tag"
    >
      <Box
        css={{
          m: '42px',
          maxWidth: '640px',
          color: '$grayText',
          img: {
            maxWidth: '85%',
          },
          '@smDown': {
            m: '16px',
            maxWidth: '85%',
            alignSelf: 'center',
          },
        }}
      >
        <h1>Saving Links to your Omnivore Library</h1>
        <hr />
        <h3>Learn how to save links to your Omnivore Library</h3>
        <p>
          Omnivore is a place to store everything you read. We keep it safe,
          organized, and easy to share.
        </p>
        <p>
          When you start using Omnivore, it is important to figure out the best
          way to save content to your library.
        </p>
        <ul>
          <li>
            <a href="#savingfromyouriphone">Saving from your iPhone</a>
          </li>
          <li>
            <a href="#savingfromyourandroiddevice">
              Saving from your Android Device
            </a>
          </li>
          <li>
            <a href="#savingfromyourcomputer">Saving from your Computer</a>
          </li>
          <li>
            <a href="#savingpdfswiththemacapp">Saving PDFs from your Mac</a>
          </li>
        </ul>
        <h2 id="savingfromyouriphone">Saving from your iPhone</h2>
        <p>
          If you are using an iPhone or iPad, the best way to save links is by
          installing the iOS app. You can find the iOS app here:{' '}
          <a href="https://omnivore.app/install/ios">
            https://omnivore.app/install/ios
          </a>
        </p>
        <p>
          With the iOS Share extension installed, you can save links from Safari
          or any other app that supports sharing links.
        </p>
        <HStack distribution="center" css={{ width: '100%', my: '32px' }}>
          <img
            width={212}
            height={347}
            src="/static/help/share-module-ios.gif"
            alt="Animated image of iOS share extension share action"
          />
        </HStack>
        <h2 id="savingfromyourandroiddevice">
          Saving from your Android Device
        </h2>
        <p>
          If you are using an Android device you can install the Omnivore
          Progressive Web App. After logging in to Omnivore in Chrome you should
          see an &#8220;Install Omnivore&#8221; option. Most Android versions
          display this at the bottom of the screen.
        </p>
        <HStack distribution="center" css={{ width: '100%', my: '32px' }}>
          <img
            src="/static/help/android-bottom-bar.png"
            alt="Save button shown on Android device"
          />
        </HStack>
        <p>
          After installing Omnivore as a Progressive Web App it will be
          displayed in your Sharing Menu on Chrome.
        </p>
        <HStack distribution="center" css={{ width: '100%', my: '32px' }}>
          <img
            src="/static/help/android-share.png"
            alt="Android device with Omnivore progressive web app installed"
          />
        </HStack>
        <h2 id="savingfromyourcomputer">Saving from your computer</h2>
        <p>
          If you are saving from a computer, you will need to install the
          Omnivore extension for the web browser(s) you use.
        </p>
        The browser extensions are available here:
        <ul>
          <li>
            <a href="https://omnivore.app/install/chrome">Chrome</a>
          </li>
          <li>
            <a href="https://omnivore.app/install/edge">Edge</a>
          </li>
          <li>
            <a href="https://omnivore.app/install/firefox">FireFox</a>
          </li>
          <li>
            <a href="https://omnivore.app/install/safari">Safari</a>
          </li>
        </ul>
        <p>
          With the browser extension(s) of your choice installed, you can tap
          the Omnivore button on any page to save your link.
        </p>
        <HStack distribution="center" css={{ width: '100%', my: '32px' }}>
          <img
            src="/static/help/share-extension.gif"
            alt="Animated image of browser plugin save action"
          />
        </HStack>
        <h2 id="savingpdfswiththemacapp">Saving PDFs with the Mac App</h2>
        <p>
          <a href="https://omnivore.app/install/mac">
            https://omnivore.app/install/mac
          </a>
        </p>
        <p>
          With the MacOS App installed you can upload PDFs from your computer to
          your Omnivore library by right-clicking and sharing to Omnivore.
        </p>
        <HStack distribution="center" css={{ width: '100%', my: '32px' }}>
          <img
            src="/static/help/saving-pdfs-mac.png"
            alt="Animated image of macOS share extension link saving"
          />
        </HStack>
        <p>
          You can enable sharing from Finder on the Mac in the Extensions
          section of System Preferences.
        </p>
        <HStack distribution="center" css={{ width: '100%', my: '32px' }}>
          <img
            src="/static/help/enable-sharing-on-mac.gif"
            alt="Animated image of enabling share extension for macOS Finder"
          />
        </HStack>
        <HStack alignment="center" css={{ mb: '32px', width: '100%' }}>
          <Link passHref href="/home">
            <Button style="ctaDarkYellow">Start Reading</Button>
          </Link>
        </HStack>
      </Box>
    </PrimaryLayout>
  )
}
