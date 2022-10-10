/* eslint-disable @next/next/no-img-element */
import { Box, HStack } from '../../components/elements/LayoutPrimitives'
import { PrimaryLayout } from '../../components/templates/PrimaryLayout'
import { Button } from '../../components/elements/Button'
import Link from 'next/link'

export default function Emails(): JSX.Element {
  return (
    <PrimaryLayout
      pageMetaDataProps={{
        title: 'Reading Newsletters in Omnivore',
        path: '/help/newsletters',
      }}
      pageTestId="help-newsletters-tag"
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
        <h1>Omnivore Email Addresses</h1>
        <hr />
        <p>
          An Omnivore email address will receive email, detect whether the email
          is a PDF document or newsletter, and add the content to your library.
        </p>
        <p>
          If Omnivore doesn&apos;t think the item should be added to your
          library, it will be forwarded to the email address you used when you
          registered for Omnivore (from <code>msgs@omnivore.app</code>).
        </p>

        <h2>Sending PDFs to your Omnivore Email Address</h2>
        <p>
          Add PDFs to your Omnivore library by sending them to your Omnivore
          email address. If there is a subject line in the email, it will be
          used as the title of the PDF. If there is no subject line, the
          filename will be used as the title.
        </p>

        <h2>Read all your newsletters in Omnivore</h2>
        <p>
          Subscribe to newsletters with your Omnivore email address and they
          will be added to your library when we receive them.
        </p>

        <p>
          <Link href="/help/newsletters">
            Learn more about setting up newsletters
          </Link>
        </p>

        <HStack alignment="center" css={{ mb: '32px', width: '100%' }}>
          <Link passHref href="/settings/emails">
            <Button style="ctaDarkYellow">Get Started</Button>
          </Link>
        </HStack>
      </Box>
      <Box css={{ height: '120px' }} />
    </PrimaryLayout>
  )
}
