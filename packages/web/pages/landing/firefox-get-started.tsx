import Link from 'next/link'
import { PageMetaData } from '../../components/patterns/PageMetaData'
import { About } from '../../components/templates/About'
import { VStack } from '../../components/elements/LayoutPrimitives'

export default function LandingPage(): JSX.Element {
  return (
    <VStack
      alignment="center"
      distribution="start"
      css={{
        background: '#3D3D3D',
        color: '#EDEDED',
        p: '50px',
        minHeight: '100vh',
        width: '100vw',
      }}
    >
      <PageMetaData
        title="Omnivore"
        path="/landing/firefox-get-started"
        ogImage="/static/images/og-homepage-03.png"
        description="Omnivore is the free, open source, read-it-later app for serious readers."
      />

      <VStack
        alignment="center"
        distribution="start"
        css={{
          background: '#3D3D3D',
          color: '#EDEDED',
          maxWidth: '520px',
          a: {
            color: '$omnivoreCtaYellow',
          },
        }}
      >
        <h1>Thank you for installing the Omnivore Firefox Extension</h1>

        <p>
          Thank you for installing our Firefox extension. A few considerations
          for new Firefox users
        </p>

        <p>
          1. To use Omnivore you need an Omnivore account. You can sign up for
          free from our <Link href="/login">login page.</Link> Before using the
          extension you should create your account and login.
        </p>

        <p>
          2. By default the extension uses your Omnivore authentication cookie
          to connect to our backend when saving pages. This means your security
          settings must allow the extension access to this cookie. If you are
          using Firefox containers we will not have access to the cookie so you
          will need to use an API key to authenticate. You can read more about
          this{' '}
          <a
            href="https://docs.omnivore.app/using/saving.html#authentication-issues"
            rel="noreferrer"
          >
            here.
          </a>
        </p>

        <p>
          3. We have a welcoming community on Discord that can help with many
          problems. If you need support you can{' '}
          <a href="https://discord.gg/h2z5rppzz9" rel="noreferrer">
            join our community on Discord.
          </a>
        </p>

        <p>
          4. You can close this tab now and get started saving and enjoying your
          reading.
        </p>
      </VStack>
    </VStack>
  )
}
