import { HStack, SpanBox, VStack } from '../../elements/LayoutPrimitives'
import { Button } from '../../elements/Button'
import { StyledText } from '../../elements/StyledText'
import { useEffect, useState } from 'react'
import { FormInput } from '../../elements/FormElements'
import { TermAndConditionsFooter } from '../LoginForm'
import { fetchEndpoint } from '../../../lib/appConfig'
import { logoutMutation } from '../../../lib/networking/mutations/logoutMutation'
import { styled } from '@stitches/react'
import { useRouter } from 'next/router'
import { parseErrorCodes } from '../../../lib/queryParamParser'
import { formatMessage } from '../../../locales/en/messages'
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

export function EmailLogin(): JSX.Element {
  const router = useRouter()
  const [email, setEmail] = useState<string | undefined>(undefined)
  const [password, setPassword] = useState<string | undefined>(undefined)
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  )

  useEffect(() => {
    if (!router.isReady) return
    const errorCode = parseErrorCodes(router.query)
    const errorMsg = errorCode
      ? formatMessage({ id: `error.${errorCode}` })
      : undefined
    setErrorMessage(errorMsg)
  }, [router.isReady, router.query])

  return (
    <form action={`${fetchEndpoint}/auth/email-login`} method="POST">
      <VStack alignment="center" css={{ padding: '16px' }}>
        <StyledText style="subHeadline" css={{ color: '$omnivoreGray' }}>
          Login
        </StyledText>
        <VStack
          css={{ width: '100%', minWidth: '320px', gap: '16px', pb: '16px' }}
        >
          <SpanBox css={{ width: '100%' }}>
            <FormLabel>Email</FormLabel>
            <BorderedFormInput
              key="email"
              type="text"
              name="email"
              value={email}
              placeholder="Email"
              onChange={(e) => {
                e.preventDefault()
                setEmail(e.target.value)
              }}
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
              onChange={(e) => setPassword(e.target.value)}
            />
          </SpanBox>
        </VStack>

        {errorMessage && <StyledText style="error">{errorMessage}</StyledText>}

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
            css={{ color: '$omnivoreGray', borderColor: '$omnivoreLightGray' }}
            type="button"
            onClick={async (event) => {
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
            Login
          </Button>
        </HStack>
        <StyledText
          style="action"
          css={{
            m: '0px',
            pt: '16px',
            width: '100%',
            color: '$omnivoreLightGray',
            textAlign: 'center',
          }}
        >
          Don&apos;t have an account?{' '}
          <Link href="/auth/email-signup" passHref>
            <StyledTextSpan style="actionLink" css={{ color: '$omnivoreGray' }}>
              Sign up
            </StyledTextSpan>
          </Link>
        </StyledText>
        <StyledText
          style="action"
          css={{
            mt: '0px',
            pt: '4px',
            width: '100%',
            color: '$omnivoreLightGray',
            textAlign: 'center',
          }}
        >
          Forgot your password?{' '}
          <Link href="/auth/forgot-password" passHref>
            <StyledTextSpan style="actionLink" css={{ color: '$omnivoreGray' }}>
              Click here
            </StyledTextSpan>
          </Link>
        </StyledText>
      </VStack>
    </form>
  )
}
