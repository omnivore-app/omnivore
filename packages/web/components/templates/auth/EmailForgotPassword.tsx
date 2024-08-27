import { SpanBox, VStack } from '../../elements/LayoutPrimitives'
import { Button } from '../../elements/Button'
import { StyledText } from '../../elements/StyledText'
import { useEffect, useRef, useState } from 'react'
import { BorderedFormInput, FormLabel } from '../../elements/FormElements'
import { fetchEndpoint } from '../../../lib/appConfig'
import { logoutMutation } from '../../../lib/networking/mutations/logoutMutation'
import { useRouter } from 'next/router'
import { formatMessage } from '../../../locales/en/messages'
import { parseErrorCodes } from '../../../lib/queryParamParser'
import { Recaptcha } from '../../elements/Recaptcha'

const ForgotPasswordForm = (): JSX.Element => {
  const [email, setEmail] = useState<string | undefined>()

  return (
    <VStack css={{ width: '100%', minWidth: '320px', gap: '16px', pb: '16px' }}>
      <VStack css={{ width: '100%', gap: '5px' }}>
        <FormLabel className="required" css={{ color: '#D9D9D9' }}>
          Email
        </FormLabel>
        <BorderedFormInput
          key="email"
          type="email"
          name="email"
          value={email}
          placeholder="Email"
          autoFocus={true}
          css={{ backgroundColor: '#2A2A2A', color: 'white', border: 'unset' }}
          onChange={(e) => {
            e.preventDefault()
            setEmail(e.target.value)
          }}
        />
      </VStack>
    </VStack>
  )
}

export function EmailForgotPassword(): JSX.Element {
  const router = useRouter()
  const [email, setEmail] = useState<string>('')
  const [errorMessage, setErrorMessage] =
    useState<string | undefined>(undefined)
  const recaptchaTokenRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!router.isReady) return
    const errorCode = parseErrorCodes(router.query)
    const errorMsg = errorCode
      ? formatMessage({ id: `error.${errorCode}` })
      : undefined
    setErrorMessage(errorMsg)
  }, [router.isReady, router.query])

  return (
    <form action={`${fetchEndpoint}/auth/forgot-password`} method="POST">
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
          Reset your password
        </StyledText>

        <ForgotPasswordForm />

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

        {errorMessage && <StyledText style="error">{errorMessage}</StyledText>}
        <Button type="submit" style="ctaBlue" css={{ my: '20px' }}>
          Reset Password
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
              color: '$omnivoreLightGray',
              textDecoration: 'underline',
              cursor: 'pointer',
            }}
          >
            Cancel
          </StyledText>
        </Button>
      </VStack>
    </form>
  )
}
