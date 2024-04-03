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
import {
  GoogleReCaptchaProvider,
  GoogleReCaptchaCheckbox,
} from '@google-recaptcha/react'
import Link from 'next/link'

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
        <FormLabel className="required">Email</FormLabel>
        <BorderedFormInput
          autoFocus={true}
          key="email"
          type="email"
          name="email"
          defaultValue={email}
          placeholder="Email"
          css={{ backgroundColor: 'white', color: 'black' }}
          onChange={(e) => {
            e.preventDefault()
            setEmail(e.target.value)
          }}
          required
        />
      </SpanBox>
      <SpanBox css={{ width: '100%' }}>
        <FormLabel className="required">Password</FormLabel>
        <BorderedFormInput
          key="password"
          type="password"
          name="password"
          defaultValue={password}
          placeholder="Password"
          css={{ bg: 'white', color: 'black' }}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </SpanBox>
      <SpanBox css={{ width: '100%' }}>
        <FormLabel className="required">Full Name</FormLabel>
        <BorderedFormInput
          key="fullname"
          type="text"
          name="name"
          defaultValue={fullname}
          placeholder="Full Name"
          css={{ bg: 'white', color: 'black' }}
          onChange={(e) => setFullname(e.target.value)}
          required
        />
      </SpanBox>
      <SpanBox css={{ width: '100%' }}>
        <FormLabel className="required">Username</FormLabel>
        <BorderedFormInput
          key="username"
          type="text"
          name="username"
          defaultValue={username}
          placeholder="Username"
          css={{ bg: 'white', color: 'black' }}
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
            color: '$omnivoreGray',
          }}
        >
          Username is available.
        </StyledText>
      )}
    </VStack>
  )
}

type RecaptchaProps = {
  setRecaptchaToken: (token: string) => void
}

const Recaptcha = (props: RecaptchaProps): JSX.Element => {
  return (
    <>
      <GoogleReCaptchaCheckbox
        key="recaptcha"
        onChange={(token) => {
          console.log('recaptcha: ', token)
          props.setRecaptchaToken(token)
        }}
      />
    </>
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
            padding: '16px',
            background: 'white',
            minWidth: '340px',
            width: '70vw',
            maxWidth: '576px',
            borderRadius: '8px',
            border: '1px solid #3D3D3D',
            boxShadow: '#B1B1B1 9px 9px 9px -9px',
          }}
        >
          <StyledText style="subHeadline" css={{ color: '$omnivoreGray' }}>
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
              style={'ctaOutlineYellow'}
              css={{
                color: '$omnivoreGray',
                borderColor: 'rgba(0, 0, 0, 0.06)',
              }}
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
            <Button type="submit" style={'ctaDarkYellow'}>
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
              <StyledTextSpan
                style="actionLink"
                css={{ color: '$omnivoreGray' }}
              >
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
