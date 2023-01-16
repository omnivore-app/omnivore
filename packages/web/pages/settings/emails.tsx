import { PrimaryLayout } from '../../components/templates/PrimaryLayout'
import { Button } from '../../components/elements/Button'
import { useGetNewsletterEmailsQuery } from '../../lib/networking/queries/useGetNewsletterEmailsQuery'
import { createNewsletterEmailMutation } from '../../lib/networking/mutations/createNewsletterEmailMutation'
import { deleteNewsletterEmailMutation } from '../../lib/networking/mutations/deleteNewsletterEmailMutation'
import { MoreOptionsIcon } from '../../components/elements/images/MoreOptionsIcon'
import { Plus, Trash, Copy } from 'phosphor-react'
import {
  Dropdown,
  DropdownOption,
} from '../../components/elements/DropdownElements'
import { theme, styled } from '../../components/tokens/stitches.config'
import {
  Box,
  SpanBox,
  HStack,
  VStack,
} from '../../components/elements/LayoutPrimitives'
import { useCopyLink } from '../../lib/hooks/useCopyLink'
import { Toaster } from 'react-hot-toast'
import { useCallback } from 'react'
import { StyledText } from '../../components/elements/StyledText'
import { applyStoredTheme } from '../../lib/themeUpdater'
import { showErrorToast, showSuccessToast } from '../../lib/toastHelpers'
import { InfoLink } from '../../components/elements/InfoLink'
import { formattedShortDate } from '../../lib/dateFormatting'

enum TextType {
  EmailAddress,
  ConfirmationCode,
}

type CopyTextButtonProps = {
  text: string
  type: TextType
}

const HeaderWrapper = styled(Box, {
  width: '100%',
  '@md': {
    display: 'block',
  },
})

const TableCard = styled(Box, {
  backgroundColor: '$grayBg',
  display: 'flex',
  alignItems: 'center',
  padding: '10px 12px',
  border: '0.5px solid $grayBgActive',
  width: '100%',

  '&:hover': {
    border: '0.5px solid #FFD234',
  },
  '@md': {
    paddingLeft: '0',
  },
})

const TableHeading = styled(Box, {
  backgroundColor: '$grayBgActive',
  border: '1px solid rgba(0, 0, 0, 0.06)',
  display: 'none',
  alignItems: 'center',
  padding: '10px 0 10px 20px',
  borderRadius: '5px 5px 0px 0px',
  width: '100%',
  '@md': {
    display: 'flex',
  },
})

const Input = styled('input', {
  backgroundColor: 'transparent',
  color: '$grayTextContrast',
  marginTop: '5px',
  marginLeft: '38px',
  '&[disabled]': {
    border: 'none',
  },
})

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
  marginLeft: '10px',
})

const MoreOptions = ({ onDelete }: { onDelete: () => void }) => (
  <Dropdown
    align={'end'}
    triggerElement={
      <Box
        css={{
          '&:hover': {
            cursor: 'pointer',
          },
        }}
      >
        <MoreOptionsIcon
          size={24}
          strokeColor={theme.colors.grayTextContrast.toString()}
          orientation="horizontal"
        />
      </Box>
    }
  >
    <DropdownOption
      onSelect={() => {
        return true
      }}
    >
      <HStack alignment={'center'} distribution={'start'}>
        <Trash size={24} color={theme.colors.omnivoreRed.toString()} />
        <Button
          css={{
            color: theme.colors.omnivoreRed.toString(),
            marginLeft: '8px',
            border: 'none',
            backgroundColor: 'transparent',
            '&:hover': {
              border: 'none',
              backgroundColor: 'transparent',
            },
          }}
          onClick={onDelete}
        >
          Delete
        </Button>
      </HStack>
    </DropdownOption>
  </Dropdown>
)

function CopyTextButton(props: CopyTextButtonProps): JSX.Element {
  const { copyLink, isLinkCopied } = useCopyLink(
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
  }, [])

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

  applyStoredTheme(false)

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
  return (
    <PrimaryLayout pageTestId="settings-emails-tag">
      <Toaster
        containerStyle={{
          top: '5rem',
        }}
      />
      <HStack css={{ width: '100%' }} alignment="center">
        <VStack
          distribution="center"
          css={{
            mx: '10px',
            width: '100%',
            maxWidth: '865px',
            color: '$grayText',
            paddingBottom: '5rem',
            paddingTop: '2rem',
            alignSelf: 'center',
            '@md': {
              m: '16px',
              alignSelf: 'center',
              mx: '42px',
              paddingTop: '0',
            },
          }}
        >
          <HeaderWrapper>
            <Box style={{ display: 'flex', alignItems: 'center' }}>
              <Box>
                <StyledText style="fixedHeadline">Email Addresses </StyledText>
              </Box>
              <InfoLink href="/help/newsletters" />
              <Button
                onClick={createEmail}
                style="ctaDarkYellow"
                css={{
                  display: 'flex',
                  alignItems: 'center',
                  marginLeft: 'auto',
                }}
              >
                <SpanBox
                  css={{
                    display: 'none',
                    '@md': {
                      display: 'flex',
                    },
                  }}
                >
                  <SpanBox>Create a new email address</SpanBox>
                </SpanBox>
                <SpanBox
                  css={{
                    p: '0',
                    display: 'flex',
                    '@md': {
                      display: 'none',
                    },
                  }}
                >
                  <Plus size={24} />
                </SpanBox>
              </Button>
            </Box>
            <TableHeading>
              <StyledText
                style="menuTitle"
                css={{
                  color: '$grayTextContrast',
                }}
              >
                Address
              </StyledText>
            </TableHeading>
          </HeaderWrapper>
          {emailAddresses &&
            emailAddresses.map((email, i) => {
              const isLastChild = i === emailAddresses.length - 1

              return (
                <TableCard
                  key={email.id}
                  css={{
                    '&:hover': {
                      background: 'rgba(255, 234, 159, 0.12)',
                    },
                    '@mdDown': {
                      borderTopLeftRadius: i === 0 ? '5px' : '',
                      borderTopRightRadius: i === 0 ? '5px' : '',
                    },
                    borderBottomLeftRadius: isLastChild ? '5px' : '',
                    borderBottomRightRadius: isLastChild ? '5px' : '',
                  }}
                >
                  <Box
                    css={{
                      display: 'flex',
                      width: '100%',
                      flexDirection: 'column',
                      paddingLeft: '20px',
                      '@md': {
                        flexDirection: 'row',
                      },
                    }}
                  >
                    <HStack
                      distribution="start"
                      css={{
                        display: 'flex',
                        padding: '4px 4px 4px 0px',
                      }}
                    >
                      <VStack css={{}}>
                        <StyledText
                          css={{
                            m: '0px',
                            fontSize: '18px',
                            '@mdDown': {
                              fontSize: '12px',
                              fontWeight: 'bold',
                            },
                          }}
                        >
                          {email.address}
                        </StyledText>
                        <StyledText
                          css={{
                            my: '5px',
                            fontSize: '11px',
                          }}
                        >
                          {`created ${formattedShortDate(email.createdAt)}, ${
                            email.subscriptionCount
                          } subscriptions`}
                        </StyledText>
                      </VStack>
                      <CopyTextBtnWrapper>
                        <CopyTextButton
                          text={email.address}
                          type={TextType.EmailAddress}
                        />
                      </CopyTextBtnWrapper>
                      <Box
                        css={{
                          marginLeft: 'auto',
                          textAlign: 'right',
                          display: 'flex',
                          '@md': {
                            display: 'none',
                          },
                        }}
                      >
                        <MoreOptions onDelete={() => deleteEmail(email.id)} />
                      </Box>
                    </HStack>
                    {email.confirmationCode && (
                      <HStack
                        distribution="start"
                        css={{
                          display: 'flex',
                          backgroundColor: '$grayBgActive',
                          borderRadius: '6px',
                          padding: '8px 4px 4px 7px',
                          '@md': {
                            padding: 'unset',
                            backgroundColor: 'transparent',
                          },
                        }}
                      >
                        <>
                          <Input
                            type="text"
                            value={email.confirmationCode}
                            disabled
                            style={{ flex: '1' }}
                          ></Input>
                          <Box>
                            <CopyTextBtnWrapper>
                              <CopyTextButton
                                text={email.confirmationCode}
                                type={TextType.ConfirmationCode}
                              />
                            </CopyTextBtnWrapper>
                          </Box>
                        </>
                      </HStack>
                    )}
                  </Box>
                  <HStack distribution={'start'} css={{ marginLeft: 'auto' }}>
                    <Box
                      css={{
                        textAlign: 'right',
                        display: 'none',
                        '@md': {
                          display: 'flex',
                        },
                      }}
                    >
                      <MoreOptions onDelete={() => deleteEmail(email.id)} />
                    </Box>
                  </HStack>
                </TableCard>
              )
            })}
        </VStack>
      </HStack>
      <Box css={{ height: '120px' }} />
    </PrimaryLayout>
  )
}
