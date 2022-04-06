import { PrimaryLayout } from '../../components/templates/PrimaryLayout'
import { Button } from '../../components/elements/Button'
import { useGetNewsletterEmailsQuery } from '../../lib/networking/queries/useGetNewsletterEmailsQuery'
import { createNewsletterEmailMutation } from '../../lib/networking/mutations/createNewsletterEmailMutation'
import { deleteNewsletterEmailMutation } from '../../lib/networking/mutations/deleteNewsletterEmailMutation'
import { MoreOptionsIcon } from '../../components/elements/images/MoreOptionsIcon'
import { Info, Plus, Trash, Copy } from 'phosphor-react'
import {
  Dropdown,
  DropdownOption,
} from '../../components/elements/DropdownElements'
import { TooltipWrapped } from '../../components/elements/Tooltip'
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
import Link from 'next/link'
import { InfoLink } from '../../components/elements/InfoLink'

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
  padding: '14px 0 14px 40px',
  borderRadius: '5px 5px 0px 0px',
  width: '100%',
  '@md': {
    display: 'flex',
  }
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
  padding: '1px',
  background: '$grayBgActive',
  borderRadius: '6px',
  border: '1px solid rgba(0, 0, 0, 0.06)',
})

const InfoIcon = styled(Info, {
  marginTop: '8px',
  '&:hover': {
    cursor: 'pointer',
  },
})

const TooltipStyle = {
  backgroundColor: '#F9D354',
  color: '#0A0806',
}

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
    showSuccessToast(props.type == TextType.EmailAddress ? 'Email Address Copied' : 'Confirmation Code Copied');
  }, [])

  return (
    <Button style="plainIcon" onClick={copy}>
      <Copy color={theme.colors.grayTextContrast.toString()} />
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
      <VStack
        distribution="center"
        css={{
          mx: '10px',
          maxWidth: '865px',
          color: '$grayText',
          paddingBottom: '5rem',
          paddingTop: '2rem',
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
              <StyledText
                style="fixedHeadline"
              >
                Email Addresses{' '}
              </StyledText>
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
              <SpanBox css={{
                display: 'none',
                '@md': {
                  display: 'flex',
                },
              }}>
                <SpanBox>Add Email</SpanBox>
              </SpanBox>
              <SpanBox css={{
                p: '0',
                display: 'flex',
                '@md': {
                  display: 'none',
                },
              }}>
                <Plus size={24} />
              </SpanBox>
            </Button>
          </Box>
          <TableHeading>
          <Box
              css={{
                flex: '49%',
              }}
            >
              <StyledText
                style="highlightTitle"
                css={{
                  color: '$grayTextContrast',
                }}
              >
                EMAIL
              </StyledText>
            </Box>
            <Box style={{ flex: '51%' }}>
              <StyledText
                style="highlightTitle"
                css={{
                  color: '$grayTextContrast',
                }}
              >
                CONFIRMATION CODE
              </StyledText>
            </Box>
          </TableHeading>
        </HeaderWrapper>
        {emailAddresses &&
          emailAddresses.map((email, i) => {
            const { address, confirmationCode, id } = email
            const isLastChild = i === emailAddresses.length - 1

            return (
              <TableCard
                key={id}
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
                    <Input
                      type="text"
                      value={address}
                      disabled
                      css={{
                        marginLeft: '0',
                        width: '100%',
                        '@md': {
                          marginLeft: '38px',
                          width: '320px',
                        },
                      }}
                    ></Input>
                    <CopyTextBtnWrapper
                      css={{
                        '@mdDown': {
                          marginRight: '10px',
                          marginLeft: '18px',
                        },
                      }}
                    >
                      <CopyTextButton
                        text={address}
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
                      <MoreOptions onDelete={() => deleteEmail(id)} />
                    </Box>
                  </HStack>
                  {confirmationCode && (
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
                          value={confirmationCode}
                          disabled
                          style={{ flex: '1' }}
                        ></Input>
                        <Box>
                          <CopyTextBtnWrapper
                            css={{
                              '@mdDown': {
                                border: 'none',
                              }
                            }}
                          >
                            <CopyTextButton
                              text={confirmationCode}
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
                    <MoreOptions onDelete={() => deleteEmail(id)} />
                  </Box>
                </HStack>
              </TableCard>
            )
          })}
      </VStack>
      <Box css={{ height: '120px' }} />
    </PrimaryLayout>
  )
}
