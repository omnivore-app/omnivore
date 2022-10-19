import { ModalRoot, ModalContent } from '../elements/ModalPrimitives'
import { HStack, VStack } from '../elements/LayoutPrimitives'
import { Button } from '../elements/Button'
import { StyledText } from '../elements/StyledText'
import { useCallback, useState } from 'react'
import { BorderedFormInput, FormInput } from '../elements/FormElements'
import { BorderedTextArea } from '../elements/StyledTextArea'
import { TermAndConditionsFooter } from '../templates/LoginForm'
import { fetchEndpoint } from '../../lib/appConfig'
import { useValidateUsernameQuery } from '../../lib/networking/queries/useValidateUsernameQuery'
import { logoutMutation } from '../../lib/networking/mutations/logoutMutation'

export function ConfirmProfileModal(): JSX.Element {
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [debouncedUsername, setDebouncedUsername] = useState('')
  const [bio, setBio] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  )

  const { isUsernameValid, usernameErrorMessage } = useValidateUsernameQuery({
    username: debouncedUsername,
  })

  const handleUsernameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      setUsername(event.target.value)
      setTimeout(() => {
        setDebouncedUsername(event.target.value)
      }, 400)
    },
    []
  )

  const handleNameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      setName(event.target.value)
    },
    [setName]
  )

  const handleBioChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
      setBio(event.target.value)
    },
    [setBio]
  )

  const submitProfile = useCallback(() => {
    if (username.length === 0) {
      setErrorMessage('Username is required')
      return
    }

    if (name.length === 0) {
      setErrorMessage('Name is required')
      return
    }

    const data = {
      name,
      username,
      bio,
    }
    fetch(`${fetchEndpoint}/auth/create-account`, {
      method: 'POST',
      redirect: 'follow',
      credentials: 'include',
      mode: 'cors',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then((response) => {
      if (response.status === 200) {
        window.localStorage.setItem('authVerified', 'true')
        window.location.href = '/home'
      } else {
        setErrorMessage('Error creating account')
      }
    })
  }, [bio, name, username])

  return (
    <ModalRoot defaultOpen>
      <ModalContent
        onPointerDownOutside={(event) => {
          event.preventDefault()
        }}
        css={{ overflow: 'auto', maxWidth: '30em' }}
      >
        <form
          onSubmit={(event) => {
            event.preventDefault()
            submitProfile()
          }}
        >
          <VStack
            alignment="center"
            css={{
              px: '$2',
              gap: '$2',
            }}
          >
            <StyledText style="subHeadline">Create Your Profile</StyledText>

            <VStack css={{ width: '100%' }}>
              <HStack
                css={{
                  width: '100%',
                  borderRadius: '6px',
                  border: `1px solid $grayBorder`,
                  p: '$2',
                }}
              >
                <StyledText css={{ m: 0, p: 0 }}>@</StyledText>
                <FormInput
                  type="text"
                  value={username}
                  placeholder="Username"
                  onChange={handleUsernameChange}
                />
              </HStack>
              {username.length > 0 && usernameErrorMessage && (
                <StyledText
                  style="caption"
                  css={{
                    m: 0,
                    pl: '$2',
                    color: '$error',
                    alignSelf: 'flex-start',
                  }}
                >
                  {usernameErrorMessage}
                </StyledText>
              )}
              {isUsernameValid && (
                <StyledText
                  style="caption"
                  css={{ m: 0, pl: '$2', alignSelf: 'flex-start', color: '$omnivoreGray' }}
                >
                  Username is available.
                </StyledText>
              )}
            </VStack>
            <BorderedFormInput
              type="text"
              value={name}
              placeholder="Name"
              onChange={handleNameChange}
              maxLength={30}
            />
            <BorderedTextArea
              css={{
                mt: '$2',
                width: '100%',
                minHeight: '$6',
              }}
              placeholder={'Bio (optional)'}
              value={bio}
              onChange={handleBioChange}
              maxLength={400}
            />
            {errorMessage && (
              <StyledText style="error">{errorMessage}</StyledText>
            )}
            <Button style="ctaDarkYellow" css={{ width: '50%', my: '$2' }}>
              Sign Up
            </Button>
            <Button
              style="ghost"
              onClick={async (e) => {
                e.preventDefault()
                window.localStorage.removeItem('authVerified')
                window.localStorage.removeItem('authToken')
                try {
                  await logoutMutation()
                } catch (e) {
                  console.log('error logging out', e)
                }
                window.location.href = '/'
              }}
            >
              <StyledText
                css={{
                  color: '$omnivoreRed',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </StyledText>
            </Button>
            <TermAndConditionsFooter />
          </VStack>
        </form>
      </ModalContent>
    </ModalRoot>
  )
}
