import { useCallback, useEffect, useMemo, useState } from 'react'
import { showErrorToast, showSuccessToast } from '../../lib/toastHelpers'
import { applyStoredTheme } from '../../lib/themeUpdater'

import { FormInput } from '../../components/elements/FormElements'
import { StyledText } from '../../components/elements/StyledText'
import { useGetViewerQuery } from '../../lib/networking/queries/useGetViewerQuery'
import { SettingsLayout } from '../../components/templates/SettingsLayout'
import { Toaster } from 'react-hot-toast'
import {
  Box,
  SpanBox,
  VStack,
} from '../../components/elements/LayoutPrimitives'
import { Button } from '../../components/elements/Button'
import { useValidateUsernameQuery } from '../../lib/networking/queries/useValidateUsernameQuery'
import { updateUserMutation } from '../../lib/networking/mutations/updateUserMutation'
import { updateUserProfileMutation } from '../../lib/networking/mutations/updateUserProfileMutation'
import { styled, theme } from '../../components/tokens/stitches.config'
import { ProgressBar } from '../../components/elements/ProgressBar'
import { useGetLibraryItemsQuery } from '../../lib/networking/queries/useGetLibraryItemsQuery'

const StyledLabel = styled('label', {
  fontWeight: 600,
  fontSize: '16px',
})

export default function Account(): JSX.Element {
  const { viewerData } = useGetViewerQuery()
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [nameUpdating, setNameUpdating] = useState(false)
  const [usernameUpdating, setUsernameUpdating] = useState(false)

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

  applyStoredTheme(false)

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
            <form
              onSubmit={(event) => {
                handleUpdateName()
                event.preventDefault()
              }}
            >
              <StyledLabel>Name</StyledLabel>
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
              gap: '10px',
              borderRadius: '5px',
            }}
          >
            <StyledLabel>Account Storage</StyledLabel>
            {!isValidating && (
              <>
                <ProgressBar
                  fillPercentage={(libraryCount ?? 0) / 50000}
                  fillColor={theme.colors.omnivoreCtaYellow.toString()}
                  backgroundColor={theme.colors.grayText.toString()}
                  borderRadius={'2px'}
                />
                <StyledText style="footnote" css={{ mt: '0px', mb: '20px' }}>
                  {`${libraryCount} of 50K library items used.`}
                </StyledText>
              </>
            )}
            <Button style="ctaDarkYellow">Upgrade</Button>
          </VStack>
        </VStack>
      </VStack>
    </SettingsLayout>
  )
}
