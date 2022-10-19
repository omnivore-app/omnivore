import { HStack, SpanBox, VStack } from '../../elements/LayoutPrimitives'
import { Button } from '../../elements/Button'
import { StyledText } from '../../elements/StyledText'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { FormInput } from '../../elements/FormElements'
import { TermAndConditionsFooter } from '../LoginForm'
import { fetchEndpoint } from '../../../lib/appConfig'
import { useValidateUsernameQuery } from '../../../lib/networking/queries/useValidateUsernameQuery'
import { logoutMutation } from '../../../lib/networking/mutations/logoutMutation'
import { styled } from '@stitches/react'
import { useRouter } from 'next/router'
import { formatMessage } from '../../../locales/en/messages'
import { parseErrorCodes } from '../../../lib/queryParamParser'
import Link from 'next/link'

const StyledTextSpan = styled('span', StyledText)

const BorderedFormInput = styled(FormInput, {
  height: '40px',
  paddingLeft: '6px',
  borderRadius: '6px',
  background: 'white',
  border: `1px solid 1px solid rgba(0, 0, 0, 0.06)`,
})

const FormLabel = styled('label', {
  fontSize: '16px',
  color: '$omnivoreGray',
})

export function EmailSignup(): JSX.Element {
  const router = useRouter()
  const [email, setEmail] = useState<string | undefined>(undefined)
  const [password, setPassword] = useState<string | undefined>(undefined)
  const [fullname, setFullname] = useState<string | undefined>(undefined)
  const [username, setUsername] = useState<string | undefined>(undefined)
  const [debouncedUsername, setDebouncedUsername] = useState<string | undefined>(undefined)
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (!router.isReady) return
    const errorCode = parseErrorCodes(router.query)
    const errorMsg = errorCode
      ? formatMessage({ id: `error.${errorCode}` })
      : undefined
    setErrorMessage(errorMsg)
  }, [router.isReady, router.query])

  const { isUsernameValid, usernameErrorMessage } = useValidateUsernameQuery({
    username: debouncedUsername ?? '',
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

  return (
    <form action={`${fetchEndpoint}/auth/email-signup`} method="POST">
      <VStack alignment="center" css={{ padding: '16px' }}>
        <StyledText style="subHeadline" css={{ color: '$omnivoreGray' }}>Sign Up</StyledText>
        <VStack css={{ width: '100%', minWidth: '320px', gap: '16px', pb: '16px' }}>
          <SpanBox css={{ width: '100%' }}>
            <FormLabel>Email</FormLabel>
            <BorderedFormInput
              key="email"
              type="text"
              name="email"
              value={email}
              placeholder="Email"
              css={{ backgroundColor: 'white', color: 'black' }}
              onChange={(e) => { e.preventDefault(); setEmail(e.target.value); }}
            />
          </SpanBox>

          <SpanBox css={{ width: '100%' }}>
            <FormLabel>Password</FormLabel>
            <BorderedFormInput
              key="password"
              type="password"
              name="password"
              value={password}
              placeholder="Password"
              css={{ bg: 'white', color: 'black' }}
              onChange={(e) => setPassword(e.target.value)}
            />
          </SpanBox>

          <SpanBox css={{ width: '100%' }}>
            <FormLabel>Full Name</FormLabel>
            <BorderedFormInput
              key="fullname"
              type="text"
              name="name"
              value={fullname}
              placeholder="Full Name"
              css={{ bg: 'white', color: 'black' }}
              onChange={(e) => setFullname(e.target.value)}
            />
          </SpanBox>

          <SpanBox css={{ width: '100%' }}>
            <FormLabel>Username</FormLabel>
            <BorderedFormInput
              key="username"
              type="text"
              name="username"
              value={username}
              placeholder="Username"
              css={{ bg: 'white', color: 'black' }}
              onChange={handleUsernameChange}
            />
          </SpanBox>
          {username && username.length > 0 && usernameErrorMessage && (
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
          <Button style={'ctaOutlineYellow'} css={{ color: '$omnivoreGray', borderColor: 'rgba(0, 0, 0, 0.06)' }} type="button" onClick={async (event) => {
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
          <Button type="submit" style={'ctaDarkYellow'}>Sign Up</Button>
        </HStack>

        <StyledText
          style="action"
          css={{
            pt: '16px',
            color: '$omnivoreLightGray',
            textAlign: 'center'
          }}
        >
          Already have an account? {' '}
          <Link href="/auth/email-login" passHref>
            <StyledTextSpan style="actionLink" css={{ color: '$omnivoreGray' }}>Login instead</StyledTextSpan>
          </Link>
        </StyledText>
        <TermAndConditionsFooter />
      </VStack>
    </form>
  )
}
