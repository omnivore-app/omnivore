import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Toaster } from 'react-hot-toast'
import { Button } from '../../components/elements/Button'
import {
  Box,
  SpanBox,
  VStack,
} from '../../components/elements/LayoutPrimitives'
import { ProgressBar } from '../../components/elements/ProgressBar'
import { StyledText } from '../../components/elements/StyledText'
import { ConfirmationModal } from '../../components/patterns/ConfirmationModal'
import { SettingsLayout } from '../../components/templates/SettingsLayout'
import { styled, theme } from '../../components/tokens/stitches.config'
import { userHasFeature } from '../../lib/featureFlag'
import { emptyTrashMutation } from '../../lib/networking/mutations/emptyTrashMutation'
import { updateEmailMutation } from '../../lib/networking/mutations/updateEmailMutation'
import { updateUserMutation } from '../../lib/networking/mutations/updateUserMutation'
import { updateUserProfileMutation } from '../../lib/networking/mutations/updateUserProfileMutation'
import { useGetLibraryItemsQuery } from '../../lib/networking/queries/useGetLibraryItemsQuery'
import { useGetViewerQuery } from '../../lib/networking/queries/useGetViewerQuery'
import { useValidateUsernameQuery } from '../../lib/networking/queries/useValidateUsernameQuery'
import { applyStoredTheme } from '../../lib/themeUpdater'
import { showErrorToast, showSuccessToast } from '../../lib/toastHelpers'
import {
  DigestChannel,
  useGetUserPersonalization,
} from '../../lib/networking/queries/useGetUserPersonalization'
import { updateDigestConfigMutation } from '../../lib/networking/mutations/updateDigestConfigMutation'
import { scheduleDigest } from '../../lib/networking/mutations/scheduleDigest'
import { optInFeature } from '../../lib/networking/mutations/optIntoFeatureMutation'

const ACCOUNT_LIMIT = 50_000

const StyledLabel = styled('label', {
  fontWeight: 600,
  fontSize: '16px',
  marginBottom: '5px',
})

export const FormInput = styled('input', {
  border: '1px solid $textNonessential',
  width: '100%',
  bg: 'transparent',
  fontSize: '16px',
  fontFamily: 'inter',
  fontWeight: 'normal',
  lineHeight: '1.35',
  borderRadius: '5px',
  textIndent: '8px',
  marginBottom: '2px',
  height: '38px',
  color: '$grayTextContrast',
  '&:focus': {
    border: '1px solid transparent',
    outline: '2px solid $omnivoreCtaYellow',
  },
})

export default function Account(): JSX.Element {
  const { viewerData } = useGetViewerQuery()
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [nameUpdating, setNameUpdating] = useState(false)
  const [usernameUpdating, setUsernameUpdating] = useState(false)
  const [email, setEmail] = useState('')
  const [emailUpdating, setEmailUpdating] = useState(false)
  const [source, setSource] = useState('')
  const [showUpdateEmailConfirmation, setShowUpdateEmailConfirmation] =
    useState(false)

  const [debouncedUsername, setDebouncedUsername] = useState('')
  const { usernameErrorMessage, isLoading: isUsernameValidationLoading } =
    useValidateUsernameQuery({
      username: debouncedUsername,
    })

  const usernameEdited = useMemo(() => {
    return username !== viewerData?.me?.profile.username
  }, [username, viewerData])

  const usernameError = useMemo(() => {
    return (
      usernameEdited &&
      username.length > 0 &&
      usernameErrorMessage &&
      !isUsernameValidationLoading
    )
  }, [
    usernameEdited,
    username,
    usernameErrorMessage,
    isUsernameValidationLoading,
  ])

  const { itemsPages, isValidating } = useGetLibraryItemsQuery('', {
    limit: 0,
    searchQuery: 'in:all',
    sortDescending: false,
  })

  const libraryCount = useMemo(() => {
    return itemsPages?.find(() => true)?.search.pageInfo.totalCount
  }, [itemsPages, isValidating])

  useEffect(() => {
    if (viewerData?.me?.profile.username) {
      setUsername(viewerData?.me?.profile.username)
    }
  }, [viewerData?.me?.profile.username])

  useEffect(() => {
    if (viewerData?.me?.name) {
      setName(viewerData?.me?.name)
    }
  }, [viewerData?.me?.name])

  useEffect(() => {
    if (viewerData?.me?.email) {
      setEmail(viewerData?.me?.email)
    }
  }, [viewerData?.me?.email])

  useEffect(() => {
    if (viewerData?.me?.source) {
      setSource(viewerData?.me?.source)
    }
  }, [viewerData?.me?.source])

  const handleUsernameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      setUsername(event.target.value)
      setTimeout(() => {
        if (event.target.value) {
          setDebouncedUsername(event.target.value)
        }
      }, 2000)
      event.preventDefault()
    },
    []
  )

  const handleUpdateName = useCallback(() => {
    setNameUpdating(true)
    ;(async () => {
      const updatedName = await updateUserMutation({ name, bio: '' })
      if (updatedName) {
        setName(updatedName)
        showSuccessToast('Name updated')
      } else {
        showErrorToast('Error updating name')
      }
      setNameUpdating(false)
    })()
  }, [name, nameUpdating, setName, setNameUpdating])

  const handleUpdateUsername = useCallback(() => {
    setUsernameUpdating(true)

    const userId = viewerData?.me?.id
    if (!userId) {
      showErrorToast('Error updating user info')
      return
    }

    ;(async () => {
      const updatedUsername = await updateUserProfileMutation({
        userId,
        username,
      })
      if (updatedUsername) {
        setUsername(updatedUsername)
        setDebouncedUsername(updatedUsername)
        showSuccessToast('Username updated')
      } else {
        showErrorToast('Error updating username')
      }
      setUsernameUpdating(false)
    })()
  }, [
    username,
    usernameUpdating,
    setUsername,
    setUsernameUpdating,
    viewerData?.me,
  ])

  const updateEmail = useCallback(() => {
    setEmailUpdating(true)
    setShowUpdateEmailConfirmation(false)
    ;(async () => {
      const response = await updateEmailMutation({ email })
      if (response) {
        setEmail(response.email)
        if (response.verificationEmailSent) {
          showSuccessToast('Verification email sent')
        } else {
          showSuccessToast('Email updated')
        }
      } else {
        // Reset if possible
        if (viewerData?.me?.email) {
          setEmail(viewerData?.me?.email)
        }
        showErrorToast('Error updating email')
      }
      setEmailUpdating(false)
    })()
  }, [email])

  const emptyTrash = useCallback(() => {
    ;(async () => {
      showSuccessToast('Emptying trash')
      const result = await emptyTrashMutation()
      if (result) {
        showSuccessToast('Emptied trash')
      } else {
        showErrorToast('Error emptying trash')
      }
    })()
  }, [])

  applyStoredTheme()

  return (
    <SettingsLayout>
      <Toaster
        containerStyle={{
          top: '5rem',
        }}
      />

      <VStack
        css={{ width: '100%', height: '100%' }}
        distribution="start"
        alignment="center"
      >
        <VStack
          css={{
            padding: '24px',
            width: '100%',
            height: '100%',
            gap: '25px',
            minWidth: '300px',
            maxWidth: '865px',
          }}
        >
          <Box>
            <StyledText style="fixedHeadline" css={{ my: '6px' }}>
              Account Details
            </StyledText>
          </Box>
          <VStack
            css={{
              padding: '24px',
              width: '100%',
              height: '100%',
              bg: '$grayBg',
              gap: '5px',
              borderRadius: '5px',
            }}
            distribution="start"
            alignment="start"
          >
            <StyledLabel>Name</StyledLabel>
            <form
              onSubmit={(event) => {
                handleUpdateName()
                event.preventDefault()
              }}
            >
              <FormInput
                type={'text'}
                value={name}
                tabIndex={1}
                placeholder={'Name'}
                disabled={nameUpdating}
                onChange={(event) => {
                  setName(event.target.value)
                  event.preventDefault()
                }}
              />
              <StyledText style="footnote" css={{ mt: '10px', mb: '20px' }}>
                Your name is displayed on your profile and is used when
                communicating with you.
              </StyledText>
              <Button type="submit" style="ctaDarkYellow">
                Update Name
              </Button>
            </form>
          </VStack>

          <VStack
            css={{
              padding: '24px',
              width: '100%',
              height: '100%',
              bg: '$grayBg',
              gap: '5px',
              borderRadius: '5px',
            }}
          >
            <StyledLabel>Username</StyledLabel>
            <form
              onSubmit={(event) => {
                handleUpdateUsername()
                event.preventDefault()
              }}
            >
              <FormInput
                type={'text'}
                placeholder={'Username'}
                value={username}
                disabled={usernameUpdating}
                onChange={(event) => {
                  handleUsernameChange(event)
                  event.preventDefault()
                }}
              />
              <SpanBox>
                <StyledText
                  style="caption"
                  css={{
                    m: 0,
                    minHeight: '20px',
                    color: usernameError ? '$error' : 'unset',
                    alignSelf: 'flex-start',
                  }}
                >
                  {usernameError && !isUsernameValidationLoading && (
                    <>{usernameErrorMessage}</>
                  )}
                  {usernameEdited &&
                    !usernameError &&
                    !isUsernameValidationLoading && <>Username is available.</>}
                </StyledText>
              </SpanBox>
              <StyledText style="footnote" css={{ mt: '10px', mb: '20px' }}>
                Your username must be unique among all users. It can only
                contain letters, numbers, and the underscore character.
              </StyledText>
              <StyledText style="footnote" css={{ mt: '10px', mb: '20px' }}>
                * Changing your username may break some links from external
                apps.
              </StyledText>
              <Button style="ctaDarkYellow">Update Username</Button>
            </form>
          </VStack>

          <VStack
            css={{
              padding: '24px',
              width: '100%',
              height: '100%',
              bg: '$grayBg',
              gap: '5px',
              borderRadius: '5px',
            }}
          >
            <StyledLabel>Email</StyledLabel>
            <form
              onSubmit={(event) => {
                // Show a confirmation dialog if switching from social login
                if (source == 'EMAIL') {
                  updateEmail()
                } else {
                  setShowUpdateEmailConfirmation(true)
                }
                event.preventDefault()
              }}
            >
              <FormInput
                type={'text'}
                placeholder={'Email'}
                value={email}
                disabled={emailUpdating}
                onChange={(event) => {
                  setEmail(event.target.value)
                  event.preventDefault()
                }}
              />
              <StyledText style="footnote" css={{ mt: '10px', mb: '20px' }}>
                Your email is used for account recovery and notifications.
              </StyledText>
              {source == 'EMAIL' ? (
                <Button style="ctaDarkYellow">Update Email</Button>
              ) : (
                <VStack>
                  <StyledText style="footnote" css={{ mt: '10px', mb: '20px' }}>
                    {`You are currently logged in with a ${source} account. To
                    convert to an email login, please click the button below.`}
                  </StyledText>
                  <Button style="ctaDarkYellow">Convert to email login</Button>
                </VStack>
              )}
            </form>
          </VStack>

          <DigestSection />

          <VStack
            css={{
              padding: '24px',
              width: '100%',
              height: '100%',
              bg: '$grayBg',
              gap: '10px',
              borderRadius: '5px',
            }}
          >
            <StyledLabel>Account Storage</StyledLabel>
            {!isValidating && (
              <>
                <ProgressBar
                  fillPercentage={((libraryCount ?? 0) / ACCOUNT_LIMIT) * 100}
                  fillColor={theme.colors.omnivoreCtaYellow.toString()}
                  backgroundColor={theme.colors.grayText.toString()}
                  borderRadius={'2px'}
                />
                <StyledText style="footnote" css={{ mt: '0px' }}>
                  {`${libraryCount} of ${ACCOUNT_LIMIT} library items used.`}
                </StyledText>
                <StyledText style="footnote" css={{ m: '0px', mb: '10px' }}>
                  NOTE: this is a soft limit, if you are approaching or have
                  exceeded this limit please contact support to have your limit
                  raised.
                </StyledText>
                <Button
                  style="ctaDarkYellow"
                  onClick={(event) => {
                    event.preventDefault()
                    emptyTrash()
                  }}
                >
                  Empty trash
                </Button>
              </>
            )}
            {/* <Button style="ctaDarkYellow">Upgrade</Button> */}
          </VStack>

          <BetaFeaturesSection />

          <VStack
            css={{
              padding: '24px',
              width: '100%',
              height: '100%',
              bg: '$grayBg',
              gap: '20px',
              borderRadius: '5px',
            }}
          >
            <StyledLabel>Danger Zone</StyledLabel>
            <Button
              style="ctaDarkYellow"
              css={{ color: 'white', background: 'red' }}
              onClick={(event) => {
                window.location.href = '/settings/delete-my-account'
              }}
            >
              Delete Account
            </Button>
          </VStack>
        </VStack>
      </VStack>

      {showUpdateEmailConfirmation ? (
        <ConfirmationModal
          message={
            'You are converting from social to email based login. This can not be undone.'
          }
          onAccept={updateEmail}
          onOpenChange={() => setShowUpdateEmailConfirmation(false)}
        />
      ) : null}
    </SettingsLayout>
  )
}

const BetaFeaturesSection = (): JSX.Element => {
  const { viewerData } = useGetViewerQuery()
  return (
    <VStack
      css={{
        padding: '24px',
        width: '100%',
        height: '100%',
        bg: '$grayBg',
        gap: '10px',
        borderRadius: '5px',
      }}
    >
      <StyledLabel>Beta features</StyledLabel>
      {viewerData?.me?.featureList.map((feature) => {
        return (
          <StyledText
            key={`feature-${feature.name}`}
            style="footnote"
            css={{ display: 'flex', gap: '5px', m: '0px' }}
          >
            <input
              type="checkbox"
              checked={userHasFeature(viewerData?.me, feature.name)}
              disabled={true}
            ></input>
            {`${feature.name}${
              userHasFeature(viewerData?.me, feature.name) ? '' : ' - Requested'
            }`}
          </StyledText>
        )
      })}
      <StyledText style="footnote" css={{ display: 'flex', gap: '5px' }}>
        To learn more about beta features available,{' '}
        <a href="https://discord.gg/h2z5rppzz9">join the Omnivore Discord</a>
      </StyledText>
    </VStack>
  )
}

const DigestSection = (): JSX.Element => {
  const [optInError, setOptInError] = useState<string | undefined>(undefined)
  const { viewerData, mutate } = useGetViewerQuery()
  const [channelState, setChannelState] = useState({
    push: false,
    email: false,
    library: false,
  })
  const {
    userPersonalization,
    isLoading: isDigestConfigLoading,
    mutate: mutatePersonalization,
  } = useGetUserPersonalization()

  useEffect(() => {
    const channels = userPersonalization?.digestConfig?.channels ?? []
    const initialState = {
      push: channels.indexOf('push') !== -1,
      email: channels.indexOf('email') !== -1,
      library: channels.indexOf('library') !== -1,
    }
    setChannelState({ ...initialState })
  }, [userPersonalization])

  const hasDigest = useMemo(() => {
    return viewerData?.me?.featureList?.some((f) => f.name === 'ai-digest')
  }, [viewerData])

  const handleDigestCheckboxChange = useCallback(
    (name: DigestChannel, checked: boolean) => {
      ;(async () => {
        const selectedChannels = channelState
        channelState[name] = checked
        setChannelState({ ...selectedChannels })

        const updatedChannels: DigestChannel[] = []
        if (channelState.push) {
          updatedChannels.push('push')
        }
        if (channelState.email) {
          updatedChannels.push('email')
        }
        if (channelState.library) {
          updatedChannels.push('library')
        }
        const result = await updateDigestConfigMutation(updatedChannels)
        if (result) {
          showSuccessToast('Updated digest config')
        } else {
          showErrorToast('Error updating digest config')
        }
        if (updatedChannels.length) {
          // Schedule the job in a timeout so the user notifications
          // make sense
          setTimeout(async () => {
            const scheduled = await scheduleDigest({
              schedule: 'daily',
              voices: ['openai-nova'],
            })
            if (scheduled) {
              showSuccessToast(
                'Your daily digest is scheduled to start tomorrow.'
              )
            } else {
              showErrorToast('Error scheduling your daily digest')
            }
          }, 500)
        } else {
          console.log('deleting daily digest job')
        }

        mutatePersonalization()
      })()
    },
    [channelState]
  )

  const requestDigestAccess = useCallback(() => {
    ;(async () => {
      const result = await optInFeature({ name: 'ai-digest' })
      if (result.ineligible) {
        setOptInError(
          'To enable digest you need to have saved at least ten library items and have two active subscriptions.'
        )
        showErrorToast('You are not eligible for Digest')
      } else if (!result.feature) {
        showErrorToast('Error enabling digest')
      } else {
        setOptInError(undefined)
      }
      mutate()
    })()
  }, [])

  const noChannelsSelected = useMemo(() => {
    return !channelState.email && !channelState.library && !channelState.push
  }, [channelState])

  return (
    <VStack
      css={{
        padding: '24px',
        width: '100%',
        height: '100%',
        bg: '$grayBg',
        gap: '10px',
        borderRadius: '5px',
      }}
    >
      <StyledLabel>Digest</StyledLabel>
      <StyledText
        style="footnote"
        css={{
          display: 'flex',
          gap: '5px',
          lineHeight: '22px',
          mt: '0px',
        }}
      >
        Omnivore Digest is a free daily digest of some of your best recent
        library items. Omnivore filters and ranks all the items recently added
        to your library, uses AI to summarize them, and creates a short library
        item, email, or a daily podcast you can listen to in our iOS app.
      </StyledText>
      <StyledText
        style="footnote"
        css={{
          display: 'flex',
          gap: '5px',
          lineHeight: '22px',
          mt: '0px',
        }}
      >
        Note that if you sign up for Digest, your recent library items will be
        processed by an AI service (Anthropic, or OpenAI). Your highlights,
        notes, and labels will not be sent to the AI service
      </StyledText>
      {hasDigest && (
        <>
          {noChannelsSelected && (
            <StyledText
              style="error"
              css={{
                display: 'flex',
                gap: '5px',
                lineHeight: '22px',
                mt: '0px',
              }}
            >
              You are opted into Omnivore Digest, please make sure to pick at
              least one channel for your digest delivery.
            </StyledText>
          )}
          <StyledText
            style="footnote"
            css={{ display: 'flex', gap: '5px', m: '0px' }}
          >
            <input
              type="checkbox"
              name="digest-library"
              checked={channelState.library}
              onChange={(event) =>
                handleDigestCheckboxChange('library', event.target.checked)
              }
            ></input>
            Deliver to library (added to your library each morning)
          </StyledText>
          <StyledText
            style="footnote"
            css={{ display: 'flex', gap: '5px', m: '0px' }}
          >
            <input
              type="checkbox"
              name="digest-email"
              checked={channelState.email}
              onChange={(event) =>
                handleDigestCheckboxChange('email', event.target.checked)
              }
            ></input>
            Deliver to email (daily email sent each morning)
          </StyledText>
          <StyledText
            style="footnote"
            css={{ display: 'flex', gap: '5px', m: '0px' }}
          >
            <input
              type="checkbox"
              name="digest-ios"
              checked={channelState.push}
              onChange={(event) =>
                handleDigestCheckboxChange('push', event.target.checked)
              }
            ></input>
            Deliver to iOS (daily podcast available in the iOS app)
          </StyledText>
        </>
      )}
      {optInError && (
        <StyledText
          style="error"
          css={{ display: 'flex', gap: '5px', m: '0px', mb: '5px' }}
        >
          {optInError}
        </StyledText>
      )}
      {!hasDigest && (
        <Button
          style="ctaDarkYellow"
          onClick={(event) => {
            requestDigestAccess()
            event.preventDefault()
          }}
        >
          Enable Digest
        </Button>
      )}
    </VStack>
  )
}
