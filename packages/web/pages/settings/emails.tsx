import { PrimaryLayout } from '../../components/templates/PrimaryLayout'
import { Button } from '../../components/elements/Button'
import { useGetNewsletterEmailsQuery } from '../../lib/networking/queries/useGetNewsletterEmailsQuery'
import { createNewsletterEmailMutation } from '../../lib/networking/mutations/createNewsletterEmailMutation'
import { CopyLinkIcon } from '../../components/elements/images/CopyLinkIcon'
import { theme } from '../../components/tokens/stitches.config'
import { Box, HStack, VStack } from '../../components/elements/LayoutPrimitives'
import { useCopyLink } from '../../lib/hooks/useCopyLink'
import { toast, Toaster } from 'react-hot-toast'
import { useCallback } from 'react'
import Link from 'next/link'
import { StyledText } from '../../components/elements/StyledText'
import { applyStoredTheme } from '../../lib/themeUpdater'

enum TextType {
  EmailAddress,
  ConfirmationCode
}

type CopyTextButtonProps = {
  text: string
  type: TextType
}

function CopyTextButton(props: CopyTextButtonProps): JSX.Element {
  const { copyLink, isLinkCopied } = useCopyLink(props.text,
    'newsletter_' + (props.type == TextType.EmailAddress ? 'email_address' : 'confirmation_code')
  )

  const copy = useCallback(() => {
    copyLink()
    toast(props.type == TextType.EmailAddress ? 'Email Address Copied' : 'Confirmation Code Copied')
  }, [])

  return (
    <Button style="plainIcon" onClick={copy}><CopyLinkIcon strokeColor={theme.colors.grayText.toString()} isCompleted={isLinkCopied} /></Button>
  )
}

export default function EmailsPage(): JSX.Element {
  const { emailAddresses, revalidate, isValidating } = useGetNewsletterEmailsQuery()

  applyStoredTheme(false)

  async function createEmail(): Promise<void> {
    await createNewsletterEmailMutation()
    revalidate()
  }

  return (
    <PrimaryLayout pageTestId="settings-emails-tag">
      <Toaster />
      <VStack
        distribution=
        "center"
        css={{
          mx: '42px',
          maxWidth: '640px',
          color: '$grayText',
          '@smDown': {
            m: '16px',
            maxWidth: '85%',
            alignSelf: 'center',
          },
        }}
      >
        <StyledText style='fixedHeadline' css={{ mb: '8px' }}>Email Addresses</StyledText>
        <StyledText style="body" css={{ mb: '42px', mt: '0px' }}>
          Add PDFs to your library, or subscribe to emails using an Omnivore email address.
        </StyledText>
        {emailAddresses && emailAddresses.map((email) => {
            return (
              <Box css={{ marginBottom: '26px' }} key={email.id}>
                <HStack distribution='end' css={{ verticalAlign: 'middle' }}>
                <input type="text" value={email.address} disabled style={{width: "280px"}}></input>
                <CopyTextButton text={email.address} type={TextType.EmailAddress} />
                </HStack>
                <HStack distribution='end' css={{ verticalAlign: 'middle' }}>
                  {email.confirmationCode && (
                    <>
                      <input type="text" value="3rwfdsdf" disabled style={{width: "120px"}}></input>
                      <CopyTextButton text={email.confirmationCode} type={TextType.ConfirmationCode} />
                    </>
                  )}
                </HStack>
              </Box>
            )
        })}
        <Box style={{ width: '100%', color: 'green' }}>
          <Button onClick={createEmail} style="ctaDarkYellow">
            Create new Email
          </Button>
        </Box>
        <p><Link href="/help/newsletters">Lean more about setting up Newsletter Email Addresses</Link></p>
      </VStack>
    </PrimaryLayout>
  )
}
