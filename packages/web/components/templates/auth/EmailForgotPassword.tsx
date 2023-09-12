import { SpanBox, VStack } from '../../elements/LayoutPrimitives'
import { Button } from '../../elements/Button'
import { StyledText } from '../../elements/StyledText'
import { useEffect, useState } from 'react'
import { BorderedFormInput, FormLabel } from '../../elements/FormElements'
import { fetchEndpoint } from '../../../lib/appConfig'
import { logoutMutation } from '../../../lib/networking/mutations/logoutMutation'
import { useRouter } from 'next/router'
import { formatMessage } from '../../../locales/en/messages'
import { parseErrorCodes } from '../../../lib/queryParamParser'

export function EmailForgotPassword(): JSX.Element {
  const router = useRouter()
  const [email, setEmail] = useState<string>('')
  const [errorMessage, setErrorMessage] =
    useState<string | undefined>(undefined)

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
          Reset your password
        </StyledText>
        <VStack
          css={{ width: '100%', minWidth: '320px', gap: '16px', pb: '16px' }}
        >
          <SpanBox css={{ width: '100%' }}>
            <FormLabel>Email</FormLabel>
            <BorderedFormInput
              key="email"
              type="email"
              name="email"
              value={email}
              placeholder="Email"
              autoFocus={true}
              css={{ bg: 'white', color: 'black' }}
              onChange={(e) => {
                e.preventDefault()
                setEmail(e.target.value)
              }}
            />
          </SpanBox>
        </VStack>

        {errorMessage && <StyledText style="error">{errorMessage}</StyledText>}
        <Button type="submit" style="ctaDarkYellow" css={{ my: '$2' }}>
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
              color: '$omnivoreRed',
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
