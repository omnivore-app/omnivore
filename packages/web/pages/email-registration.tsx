import { PrimaryLayout } from '../components/templates/PrimaryLayout'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { StyledText } from '../components/elements/StyledText'
import { fetchEndpoint } from '../lib/appConfig'
import { parseErrorCodes } from '../lib/queryParamParser'
import { formatMessage } from '../locales/en/messages'

export default function EmailRegistration(): JSX.Element {
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  )
  const router = useRouter()

  useEffect(() => {
    if (!router.isReady) return
    const errorCode = parseErrorCodes(router.query)
    const message = errorCode
      ? formatMessage({ id: `error.${errorCode}` })
      : undefined
    setErrorMessage(message)
  }, [router.isReady, router.query])

  return (
    <PrimaryLayout pageTestId="email-registration">
      <h1>Email Registration</h1>
      <form action={`${fetchEndpoint}/auth/email-signup`} method="POST">
        <div>
          <label>Email</label>
          <input type="email" name={'email'} required />
        </div>
        <div>
          <label>Password</label>
          <input type="password" name={'password'} required maxLength={40} />
        </div>
        <div>
          <label>Full Name</label>
          <input type="text" name={'name'} required />
        </div>
        <div>
          <label>Username</label>
          <input type="text" name={'username'} required />
        </div>
        <div>
          <label>Bio</label>
          <input type="text" name={'bio'} />
        </div>
        {errorMessage && <StyledText style="error">{errorMessage}</StyledText>}
        <button type="submit">Signup</button>
      </form>
    </PrimaryLayout>
  )
}
