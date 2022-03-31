/* eslint-disable @next/next/no-img-element */
import { Box, HStack, SpanBox } from '../../components/elements/LayoutPrimitives'
import { PrimaryLayout } from '../../components/templates/PrimaryLayout'
import { Button } from '../../components/elements/Button'
import Link from 'next/link'
import { StyledText } from '../../components/elements/StyledText'
import { styled } from '@stitches/react'
import { Copy, Plus } from 'phosphor-react'
import { theme } from '../../components/tokens/stitches.config'

const AddEmailButton = () => {
  return (<Button
    onClick={() => {}}
    style="ctaDarkYellow"
    css={{
      cursor: 'default',
      display: 'inline-flex',
      alignItems: 'center',
    }}
  >
    <Plus size={18} style={{ marginRight: '6.5px' }} />
    <SpanBox>Add Email</SpanBox>
  </Button>)
}

const CopyButton = () => {
  return (
    <Button style="plainIcon" css={{
      pl: '2px',
      pr: '4px',
      cursor: 'default',
      display: 'inline-flex',
    }}
    onClick={() => {}}
  >
    <Copy color={theme.colors.grayTextContrast.toString()} />
  </Button>)
}

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
          An Omnivore email address will receive email, detect whether the email is a PDF document or newsletter, 
          and add the content to your library.
        </p>
        <p>
          If Omnivore doesn't think the item should be added to your library, 
          it will be forwarded to the email address you used when you registered
          for Omnivore (from <code>msgs@omnivore.app</code>).
        </p>

        <h2>Sending PDFs to your Omnivore Email Address</h2>
        <p>
          Add PDFs to your Omnivore library by sending them to your Omnivore email address. If there is a subject
          line in the email, it will be used as the title of the PDF. If there is no subject line, the filename will
          be used as the title.
        </p>

        <h2>Read all your newsletters in Omnivore</h2>
        <p>
          Subscribe to newsletters with your Omnivore email address and they 
          will be added to your library when we receive them.
        </p>

        <p><a href="/help/newsletters">Learn more about setting up newsletters</a></p>

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
