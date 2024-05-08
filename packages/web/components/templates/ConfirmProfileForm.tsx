import { ModalRoot, ModalContent } from '../elements/ModalPrimitives'
import { HStack, SpanBox, VStack } from '../elements/LayoutPrimitives'
import { Button } from '../elements/Button'
import { StyledText } from '../elements/StyledText'
import { useCallback, useState } from 'react'
import {
  BorderedFormInput,
  FormInput,
  FormLabel,
} from '../elements/FormElements'
import { TermAndConditionsFooter } from './LoginForm'
import { fetchEndpoint } from '../../lib/appConfig'
import { useValidateUsernameQuery } from '../../lib/networking/queries/useValidateUsernameQuery'
import { logoutMutation } from '../../lib/networking/mutations/logoutMutation'

export function ConfirmProfileForm(): JSX.Element {
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [debouncedUsername, setDebouncedUsername] = useState('')
  const [bio, setBio] = useState('')
  const [errorMessage, setErrorMessage] =
    useState<string | undefined>(undefined)

  const { isUsernameValid, usernameErrorMessage } = useValidateUsernameQuery({
    username: debouncedUsername,
  })

  const handleUsernameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      setUsername(event.target.value)
      setTimeout(() => {
        setDebouncedUsername(event.target.value)
      }, 2000)
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
    <form
      onSubmit={(event) => {
        event.preventDefault()
        submitProfile()
      }}
    >
      <VStack
        alignment="center"
        css={{
          padding: '16px',
          minWidth: '340px',
          width: '70vw',
          maxWidth: '576px',
          borderRadius: '8px',
          background: '#343434',
          border: '1px solid #6A6968',
          boxShadow: '0px 4px 4px 0px rgba(0, 0, 0, 0.15)',
        }}
      >
        <StyledText style="subHeadline" css={{ color: '#D9D9D9' }}>
          Create profile
        </StyledText>

        <VStack
          css={{ width: '100%', minWidth: '320px', gap: '16px', pb: '16px' }}
        >
          <VStack css={{ width: '100%', gap: '5px' }}>
            <FormLabel className="required" css={{ color: '#D9D9D9' }}>
              Username
            </FormLabel>
            <BorderedFormInput
              autoFocus={true}
              type="text"
              name="username"
              value={username}
              placeholder="Username"
              onChange={handleUsernameChange}
              css={{
                backgroundColor: '#2A2A2A',
                color: 'white',
                border: 'unset',
              }}
              required
            />
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
                css={{
                  m: 0,
                  pl: '$2',
                  alignSelf: 'flex-start',
                }}
              >
                Username is available.
              </StyledText>
            )}
          </VStack>

          <VStack css={{ width: '100%', gap: '5px' }}>
            <FormLabel className="required" css={{ color: '#D9D9D9' }}>
              Name
            </FormLabel>
            <BorderedFormInput
              type="text"
              value={name}
              placeholder="Name"
              onChange={handleNameChange}
              css={{
                backgroundColor: '#2A2A2A',
                color: 'white',
                border: 'unset',
              }}
              maxLength={30}
            />
          </VStack>
          {errorMessage && (
            <StyledText style="error">{errorMessage}</StyledText>
          )}
          <HStack
            alignment="center"
            distribution="end"
            css={{
              gap: '10px',
              width: '100%',
              height: '80px',
            }}
          >
            <Button
              style="cancelAuth"
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
              Cancel
            </Button>
            <Button
              style="ctaBlue"
              css={{
                padding: '10px 50px',
              }}
            >
              Sign Up
            </Button>
          </HStack>
          <TermAndConditionsFooter />
        </VStack>
      </VStack>
    </form>
  )
}
