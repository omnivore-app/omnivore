import { HStack, SpanBox, VStack } from '../../elements/LayoutPrimitives'
import { Button } from '../../elements/Button'
import { StyledText, StyledTextSpan } from '../../elements/StyledText'
import { useCallback, useEffect, useRef, useState } from 'react'
import { BorderedFormInput, FormLabel } from '../../elements/FormElements'
import { TermAndConditionsFooter } from '../LoginForm'
import { fetchEndpoint } from '../../../lib/appConfig'
import { useValidateUsernameQuery } from '../../../lib/networking/queries/useValidateUsernameQuery'
import { logoutMutation } from '../../../lib/networking/mutations/logoutMutation'
import { useRouter } from 'next/router'
import { formatMessage } from '../../../locales/en/messages'
import { parseErrorCodes } from '../../../lib/queryParamParser'
import Link from 'next/link'
import { Recaptcha } from '../../elements/Recaptcha'

const SignUpForm = (): JSX.Element => {
  const [email, setEmail] = useState<string | undefined>()
  const [password, setPassword] = useState<string | undefined>()
  const [fullname, setFullname] = useState<string | undefined>()
  const [username, setUsername] = useState<string | undefined>()
  const [debouncedUsername, setDebouncedUsername] =
    useState<string | undefined>()

  const { isUsernameValid, usernameErrorMessage } = useValidateUsernameQuery({
    username: debouncedUsername ?? '',
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

  return (
    <VStack css={{ width: '100%', minWidth: '320px', gap: '16px', pb: '16px' }}>
      <SpanBox css={{ width: '100%' }}>
        <FormLabel className="required" css={{ color: '#D9D9D9' }}>
          Email
        </FormLabel>
        <BorderedFormInput
          autoFocus={true}
          key="email"
          type="email"
          name="email"
          defaultValue={email}
          placeholder="Email"
          css={{ backgroundColor: '#2A2A2A', color: 'white', border: 'unset' }}
          onChange={(e) => {
            e.preventDefault()
            setEmail(e.target.value)
          }}
          required
        />
      </SpanBox>
      <SpanBox css={{ width: '100%' }}>
        <FormLabel className="required" css={{ color: '#D9D9D9' }}>
          Password
        </FormLabel>
        <BorderedFormInput
          key="password"
          type="password"
          name="password"
          defaultValue={password}
          placeholder="Password"
          css={{ backgroundColor: '#2A2A2A', color: 'white', border: 'unset' }}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </SpanBox>
      <SpanBox css={{ width: '100%' }}>
        <FormLabel className="required" css={{ color: '#D9D9D9' }}>
          Full Name
        </FormLabel>
        <BorderedFormInput
          key="fullname"
          type="text"
          name="name"
          defaultValue={fullname}
          placeholder="Full Name"
          css={{ backgroundColor: '#2A2A2A', color: 'white', border: 'unset' }}
          onChange={(e) => setFullname(e.target.value)}
          required
        />
      </SpanBox>
      <SpanBox css={{ width: '100%' }}>
        <FormLabel className="required" css={{ color: '#D9D9D9' }}>
          Username
        </FormLabel>
        <BorderedFormInput
          key="username"
          type="text"
          name="username"
          defaultValue={username}
          placeholder="Username"
          css={{ backgroundColor: '#2A2A2A', color: 'white', border: 'unset' }}
          onChange={handleUsernameChange}
          required
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
  )
}

export function EmailSignup(): JSX.Element {
  const router = useRouter()
  const recaptchaTokenRef = useRef<HTMLInputElement>(null)
  const [errorMessage, setErrorMessage] = useState<string | undefined>()

  useEffect(() => {
    if (!router.isReady) return
    const errorCode = parseErrorCodes(router.query)
    const errorMsg = errorCode
      ? formatMessage({ id: `error.${errorCode}` })
      : undefined
    setErrorMessage(errorMsg)
  }, [router.isReady, router.query])

  return (
    <>
      <form action={`${fetchEndpoint}/auth/email-signup`} method="POST">
        <VStack
          alignment="center"
          css={{
            padding: '20px',
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
            Sign Up
          </StyledText>

          <SignUpForm />

          {process.env.NEXT_PUBLIC_RECAPTCHA_CHALLENGE_SITE_KEY && (
            <>
              <Recaptcha
                setRecaptchaToken={(token) => {
                  if (recaptchaTokenRef.current) {
                    recaptchaTokenRef.current.value = token
                  } else {
                    console.log('error updating recaptcha token')
                  }
                }}
              />
              <input
                ref={recaptchaTokenRef}
                type="hidden"
                name="recaptchaToken"
              />
            </>
          )}

          {errorMessage && (
            <StyledText style="error">{errorMessage}</StyledText>
          )}

          <StyledText
            style="caption"
            css={{
              p: '0px',
              color: '$omnivoreLightGray',
            }}
          >
            Omnivore will send you daily tips for your first week as a new user.
            If you don&apos;t like them you can unsubscribe.
          </StyledText>

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
              type="button"
              onClick={async () => {
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
              type="submit"
              style="ctaBlue"
              css={{
                padding: '10px 50px',
              }}
            >
              Sign Up
            </Button>
          </HStack>

          <StyledText
            style="action"
            css={{
              pt: '16px',
              color: '$omnivoreLightGray',
              textAlign: 'center',
            }}
          >
            Already have an account?{' '}
            <Link href="/auth/email-login" passHref legacyBehavior>
              <StyledTextSpan style="actionLink" css={{ color: '$ctaBlue' }}>
                Login instead
              </StyledTextSpan>
            </Link>
          </StyledText>
          <TermAndConditionsFooter />
        </VStack>
      </form>
    </>
  )
}
