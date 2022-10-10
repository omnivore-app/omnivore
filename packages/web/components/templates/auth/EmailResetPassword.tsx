import { SpanBox, VStack } from '../../elements/LayoutPrimitives'
import { Button } from '../../elements/Button'
import { StyledText } from '../../elements/StyledText'
import { useEffect, useState } from 'react'
import { FormInput } from '../../elements/FormElements'
import { TermAndConditionsFooter } from '../LoginForm'
import { fetchEndpoint } from '../../../lib/appConfig'
import { logoutMutation } from '../../../lib/networking/mutations/logoutMutation'
import { styled } from '@stitches/react'
import { useRouter } from 'next/router'
import { formatMessage } from '../../../locales/en/messages'
import { parseErrorCodes } from '../../../lib/queryParamParser'
import { LoadingView } from '../../patterns/LoadingView'

const BorderedFormInput = styled(FormInput, {
  height: '40px',
  paddingLeft: '6px',
  borderRadius: '6px',
  background: 'white',
  color: '$omnivoreGray',
  border: `1px solid 1px solid rgba(0, 0, 0, 0.06)`,
})

const FormLabel = styled('label', {
  fontSize: '16px',
  color: '$omnivoreGray',
})

export function EmailResetPassword(): JSX.Element {
  const router = useRouter()
  const [token, setToken] = useState<string | undefined>(undefined)
  const [password, setPassword] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  )

  useEffect(() => {
    if (!router.isReady) return
    const errorCode = parseErrorCodes(router.query)
    const errorMsg = errorCode
      ? formatMessage({ id: `error.${errorCode}` })
      : undefined

    console.log('errorCode', errorCode, errorMsg)

    setErrorMessage(errorMsg)
    setToken(router.query.token as string)
  }, [router.isReady, router.query])

  if (!token) {
    return <LoadingView />
  }

  return (
    <form action={`${fetchEndpoint}/auth/reset-password`} method="POST">
      <VStack alignment="center" css={{ padding: '16px' }}>
        <VStack
          css={{ width: '100%', minWidth: '320px', gap: '16px', pb: '16px' }}
        >
          <SpanBox css={{ width: '100%' }}>
            <FormLabel>Enter new password</FormLabel>
            <BorderedFormInput
              type="password"
              key="password"
              name="password"
              value={password}
              placeholder="Password"
              onChange={(e) => {
                e.preventDefault()
                setPassword(e.target.value)
              }}
            />
            <FormLabel css={{ fontSize: '12px' }}>
              (Password must be at least 8 chars)
            </FormLabel>

            <input type="hidden" name="token" value={token} />
          </SpanBox>
        </VStack>

        {errorMessage && <StyledText style="error">{errorMessage}</StyledText>}
        <Button type="submit" style="ctaDarkYellow" css={{ my: '$2' }}>
          Update Password
        </Button>
      </VStack>
    </form>
  )
}
