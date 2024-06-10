import { Button } from '../../../components/elements/Button'
import { useGetNewsletterEmailsQuery } from '../../../lib/networking/queries/useGetNewsletterEmailsQuery'
import { createNewsletterEmailMutation } from '../../../lib/networking/mutations/createNewsletterEmailMutation'
import { deleteNewsletterEmailMutation } from '../../../lib/networking/mutations/deleteNewsletterEmailMutation'
import { Copy } from '@phosphor-icons/react'
import { theme, styled } from '../../../components/tokens/stitches.config'
import {
  Box,
  HStack,
  SpanBox,
} from '../../../components/elements/LayoutPrimitives'
import { useCopyLink } from '../../../lib/hooks/useCopyLink'
import { useCallback, useMemo, useState } from 'react'
import { StyledText } from '../../../components/elements/StyledText'
import { applyStoredTheme } from '../../../lib/themeUpdater'
import { showErrorToast, showSuccessToast } from '../../../lib/toastHelpers'
import { formattedShortDate } from '../../../lib/dateFormatting'
import Link from 'next/link'
import {
  EmptySettingsRow,
  SettingsTable,
  SettingsTableRow,
} from '../../../components/templates/settings/SettingsTable'
import { ConfirmationModal } from '../../../components/patterns/ConfirmationModal'

enum TextType {
  EmailAddress,
  ConfirmationCode,
}

type CopyTextButtonProps = {
  text: string
  type: TextType
}

const CopyTextBtnWrapper = styled(Box, {
  background: '$grayBgActive',
  borderRadius: '6px',
  border: '1px solid rgba(0, 0, 0, 0.06)',
  width: '32px',
  height: '32px',

  display: 'flex',

  color: '#3D3D3D',

  alignItems: 'center',
  justifyContent: 'center',
})

function CopyTextButton(props: CopyTextButtonProps): JSX.Element {
  const { copyLink } = useCopyLink(
    props.text,
    'newsletter_' +
      (props.type == TextType.EmailAddress
        ? 'email_address'
        : 'confirmation_code')
  )

  const copy = useCallback(() => {
    copyLink()
    showSuccessToast(
      props.type == TextType.EmailAddress
        ? 'Email Address Copied'
        : 'Confirmation Code Copied'
    )
  }, [copyLink, props.type])

  return (
    <Button style="plainIcon" onClick={copy}>
      <Copy
        width={16}
        height={16}
        color={theme.colors.grayTextContrast.toString()}
      />
    </Button>
  )
}

export default function EmailsPage(): JSX.Element {
  const { emailAddresses, revalidate, isValidating } =
    useGetNewsletterEmailsQuery()
  const [confirmDeleteEmailId, setConfirmDeleteEmailId] = useState<
    undefined | string
  >(undefined)

  applyStoredTheme()

  async function createEmail(): Promise<void> {
    const email = await createNewsletterEmailMutation()
    if (!email) {
      showErrorToast('Error Creating Email')
      return
    }
    showSuccessToast('Email Created')
    revalidate()
  }

  async function deleteEmail(id: string): Promise<void> {
    const result = await deleteNewsletterEmailMutation(id)
    if (!result) {
      showErrorToast('Error Deleting Email')
      return
    }
    revalidate()
    showSuccessToast('Email Deleted')
  }

  const sortedEmailAddresses = useMemo(() => {
    if (!emailAddresses) {
      return []
    }
    return emailAddresses.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  }, [emailAddresses])

  return (
    <>
      <SettingsTable
        pageId="settings-emails-tag"
        pageInfoLink="https://docs.omnivore.app/using/inbox.html"
        headerTitle="Address"
        createTitle="Create a new email address"
        createAction={createEmail}
        suggestionInfo={{
          title: 'Subscribe to newsletters with an Omnivore Email Address',
          message:
            'Create an Omnivore email address and use it to subscribe to newsletters or send yourself documents. Newsletters and documents will be categorized and added to your library when we receive a message. View all received emails with the "Recently Received Emails" link at the bottom of this page.',
          docs: 'https://docs.omnivore.app/using/inbox.html',
          key: '--settings-emails-show-help',
          CTAText: 'Create an email address',
          onClickCTA: () => {
            createEmail()
          },
        }}
      >
        {sortedEmailAddresses.length > 0 ? (
          sortedEmailAddresses.map((email, i) => {
            return (
              <SettingsTableRow
                key={email.address}
                title={email.address}
                isLast={i === sortedEmailAddresses.length - 1}
                onDelete={() => setConfirmDeleteEmailId(email.id)}
                deleteTitle="Delete"
                sublineElement={
                  <StyledText
                    css={{
                      my: '5px',
                      fontSize: '11px',
                      a: {
                        color: '$omnivoreCtaYellow',
                      },
                    }}
                  >
                    {`created ${formattedShortDate(email.createdAt)}, `}
                    <Link
                      href="/settings/subscriptions"
                      legacyBehavior
                    >{`${email.subscriptionCount} subscriptions`}</Link>
                  </StyledText>
                }
                titleElement={
                  <CopyTextBtnWrapper
                    css={{
                      marginLeft: '20px',
                      '@mdDown': {
                        marginRight: '10px',
                      },
                    }}
                  >
                    <CopyTextButton
                      text={email.address}
                      type={TextType.EmailAddress}
                    />
                  </CopyTextBtnWrapper>
                }
                extraElement={
                  email.confirmationCode ? (
                    <HStack
                      alignment="start"
                      distribution="center"
                      css={{
                        width: '100%',
                        backgroundColor: '$grayBgActive',
                        borderRadius: '6px',
                        padding: '4px 4px 4px 0px',
                        '@md': {
                          width: '30%',
                          backgroundColor: 'transparent',
                        },
                      }}
                    >
                      <>
                        <StyledText
                          css={{
                            fontSize: '11px',
                            '@md': {
                              marginTop: '5px',
                            },
                            '@mdDown': {
                              marginLeft: 'auto',
                            },
                            marginRight: '10px',
                          }}
                        >
                          {`Gmail: ${email.confirmationCode}`}
                        </StyledText>
                        <Box>
                          <CopyTextBtnWrapper>
                            <CopyTextButton
                              text={email.confirmationCode || ''}
                              type={TextType.ConfirmationCode}
                            />
                          </CopyTextBtnWrapper>
                        </Box>
                      </>
                    </HStack>
                  ) : (
                    <></>
                  )
                }
              />
            )
          })
        ) : (
          <EmptySettingsRow
            text={isValidating ? '-' : 'No Email Addresses Found'}
          />
        )}
        <SpanBox
          css={{
            pt: '15px',
            fontSize: '12px',
            marginLeft: 'auto',
            a: {
              color: '$omnivoreCtaYellow',
            },
          }}
        >
          <Link href="/settings/emails/recent">
            View recently received emails
          </Link>
        </SpanBox>
      </SettingsTable>

      {confirmDeleteEmailId ? (
        <ConfirmationModal
          message={
            'Are you sure? You will stop receiving emails sent to this address.'
          }
          onAccept={async () => {
            await deleteEmail(confirmDeleteEmailId)
            setConfirmDeleteEmailId(undefined)
          }}
          onOpenChange={() => setConfirmDeleteEmailId(undefined)}
        />
      ) : null}
    </>
  )
}
