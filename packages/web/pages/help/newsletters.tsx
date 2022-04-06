/* eslint-disable @next/next/no-img-element */
import { Box, HStack, SpanBox } from '../../components/elements/LayoutPrimitives'
import { PrimaryLayout } from '../../components/templates/PrimaryLayout'
import { Button } from '../../components/elements/Button'
import Link from 'next/link'
import { Copy, Plus } from 'phosphor-react'
import { theme } from '../../components/tokens/stitches.config'

const AddEmailButton = () => {
  return (<Button
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
  >
    <Copy color={theme.colors.grayTextContrast.toString()} />
  </Button>)
}

export default function Newsletters(): JSX.Element {
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
        <h1>Read Newsletters in Omnivore</h1>
        <hr />
        <p>Omnivore supports newsletters from the following providers:</p>
        <ul>
          <li>Newsletters hosted on <a href="https://substack.com" target="_blank" rel="noreferrer">substack.com</a></li>
          <li>Newsletters hosted on <a href="https://www.beehiiv.com/" target="_blank" rel="noreferrer">beehiiv.com</a></li>
          <li>The <a href="https://www.axios.com/newsletters" target="_blank" rel="noreferrer">Axios Daily</a> newsletters</li>
          <li><a href="https://golangweekly.com/" target="_blank" rel="noreferrer">Golang Weekly</a></li>
          <li><a href="https://www.bloomberg.com/account/newsletters" target="_blank" rel="noreferrer">Bloomberg Newsletters</a></li>
        </ul>
        <p>If there is a newsletter you would like to read in Omnivore, please let us know.</p>

        <h2>Omnivore Email Addresses</h2>
        <p>
          Omnivore allows you to create unique email addresses for subscribing to newsletters.
          You can reuse one address for all your newsletters, or you can create a unique address
          for each.
        </p>
        <p>
          An Omnivore email address will receive email, detect whether the email is a newsletter,
          and add the newsletter content to your library. If the email does not appear to be a newsletter,
          it will be forwarded to the email address you used when you registered for Omnivore.
        </p>

        <p>There are multiple ways to add newsletters to your Omnivore library:</p>
        <ul>
          <li><a href="#updating">Updating your account email to an Omnivore email address</a></li>
          <li><a href="#directly">Subscribe to the newsletter with an Omnivore email address</a></li>
          <li><a href="#forwarding">Create a forwarding rule from your email account</a></li>
        </ul>

        <h2 id="updating">Updating your account email</h2>
        <p>
          If you want all your substack newsletters sent to Omnivore, you can login and change the
          address on <a href="https://substack.com/account/settings">your account page</a> in Substack.
        </p>

        <h2 id="directly">Subscribing Directly</h2>
        <p>
          Create your first email address by clicking the <AddEmailButton /> button on
          the <Link href='/settings/emails'>emails page</Link>. Copy the email address 
          to your clipboard using the <CopyButton />
          copy button, and enter that email address into an email subscription box.
        </p>

        <HStack distribution="center" css={{ width: '100%', my: '32px' }}>
          <img
            src="/static/help/newsletter-email-signup.gif"
            alt="Animated image setting up an Omnivore Email Address"
          />
        </HStack>

        <p>
          If you are already logged into Substack you might need to logout to use your new email address.
        </p>

        <h2 id="forwarding">Create a Forwarding Rule</h2>

        <p>
          If you are a Gmail user you can create a forwarding rule to send email from your regular account
          to your Omnivore email address. This is useful if you have an existing paid newsletter subscription and
          don&apos;t want to update your account email address.
        </p>

        <p>
          For free newsletters we recommend subscribing directly to the newsletter with your Omnivore email address
          instead of setting up forwarding rules.
        </p>

        <p>Before you start:</p>
        <ul>
          <li>Create an Omnivore Email Address by clicking the <AddEmailButton /> button on the <Link href='/settings/emails'>emails page</Link>.</li>
          <li>Make a note of the Newsletter&apos;s sender email address. For example <code>omnivore@substack.com</code>.</li>
        </ul>

        <p>Create a forwarding rule:</p>
        <ul>
          <li>
            On a computer open your <Link href="https://mail.google.com/mail/u/0/#settings/fwdandpop">Gmail Forwarding Rules</Link>.
            If this link does not work: click on the Gear icon in the upper right corner of Gmail
              and select All Settings, then click the Forwarding and POP/IMAP tab.
          </li>
          <li>In the <b>Forwarding</b> section click <b>Add a forwarding address</b>.</li>
          <li>Enter your Omnivore Email Address (eg <code>username-sdfsd@inbox.omnivore.app</code>) and click Next.</li>
          <li>Click Proceed and OK</li>
          <li>Refresh the Omnivore Newsletter Emails page and you should see a code appear beside your address (eg 663421251).
            Copy this code to your clipboard (click the <CopyButton /> button).
          </li>
          <li>
            Return to your forwarding rules section and look for the confirm code text box.
            Enter the confirmation code you copied and click <b>Verify</b>.
          </li>
          <li>In the forwarding section of Gmail, Click on <b>Creating a Filter</b></li>
          <li>Add the email address of your newsletter (eg omnivore@substack.app) in the <code>From</code> section.</li>
          <li>Click <code>Create Filter</code></li>
          <li>Choose <b>Forward it to</b> and enter your Omnivore Email Address (eg  <code>username-sdfsd@inbox.omnivore.app</code>)</li>
          <li>Click <code>Create Filter</code> at the bottom of the dialog.</li>
        </ul>
      </Box>
      <Box css={{ height: '120px' }} />
    </PrimaryLayout>
  )
}
