import { useCallback, useEffect, useMemo, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { Button } from '../../components/elements/Button'
import {
  Box,
  SpanBox,
  VStack,
} from '../../components/elements/LayoutPrimitives'
import { StyledText } from '../../components/elements/StyledText'
import { SettingsLayout } from '../../components/templates/SettingsLayout'
import { styled, theme } from '../../components/tokens/stitches.config'
import { updateEmailMutation } from '../../lib/networking/mutations/updateEmailMutation'
import { updateUserMutation } from '../../lib/networking/mutations/updateUserMutation'
import { updateUserProfileMutation } from '../../lib/networking/mutations/updateUserProfileMutation'
import { useGetLibraryItemsQuery } from '../../lib/networking/queries/useGetLibraryItemsQuery'
import { useGetViewerQuery } from '../../lib/networking/queries/useGetViewerQuery'
import { useValidateUsernameQuery } from '../../lib/networking/queries/useValidateUsernameQuery'
import { applyStoredTheme } from '../../lib/themeUpdater'
import { showErrorToast, showSuccessToast } from '../../lib/toastHelpers'
import { ConfirmationModal } from '../../components/patterns/ConfirmationModal'
import { ProgressBar } from '../../components/elements/ProgressBar'
import { emptyTrashMutation } from '../../lib/networking/mutations/emptyTrashMutation'

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

  const { itemsPages, isValidating } = useGetLibraryItemsQuery({
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
            {!isValidating && (
              <>
                {viewerData?.me?.features.map((feature) => {
                  return (
                    <StyledText
                      key={`feature-${feature}`}
                      style="footnote"
                      css={{ display: 'flex', gap: '5px' }}
                    >
                      <input
                        type="checkbox"
                        checked={true}
                        disabled={true}
                      ></input>
                      {feature}
                    </StyledText>
                  )
                })}
                <StyledText
                  style="footnote"
                  css={{ display: 'flex', gap: '5px' }}
                >
                  To learn more about beta features available,{' '}
                  <a href="https://discord.gg/h2z5rppzz9">
                    join the Omnivore Discord
                  </a>
                </StyledText>
              </>
            )}
            {/* <Button style="ctaDarkYellow">Upgrade</Button> */}
          </VStack>

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
