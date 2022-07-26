import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Toaster } from 'react-hot-toast'

import { applyStoredTheme } from '../../lib/themeUpdater'

import { PrimaryLayout } from '../../components/templates/PrimaryLayout'

import { HStack, SpanBox } from '../../components/elements/LayoutPrimitives'
import { Loader } from '../../components/templates/SavingRequest'
import { fetchEndpoint } from '../../lib/appConfig'
import { LoadingView } from '../../components/patterns/LoadingView'

export default function ConfirmEmail(): JSX.Element {
  const router = useRouter()
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)

  applyStoredTheme(false)

  useEffect(() => {
    if (!router || !router.isReady) {
      return
    }

    const token = router.query.token
    fetch(`${fetchEndpoint}/auth/confirm-email`, {
      method: 'POST',
      redirect: 'follow',
      mode: 'cors',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    }).then((response) => {
      if (response.status === 200) {
        window.localStorage.setItem('authVerified', 'true')
        window.location.href = '/'
      } else {
        setErrorMessage('Error confirming email')
      }
    })

  }, [router])

  return (
    <PrimaryLayout pageTestId={'api-keys'}>
      <Toaster
        containerStyle={{
          top: '5rem',
        }}
      />
      <HStack css={{ bg: '$grayBg', padding: '24px', width: '100%', height: '100%'}}>
        {errorMessage ? (
          <SpanBox >{errorMessage}</SpanBox>
        ) : <LoadingView />}
      </HStack>
    </PrimaryLayout>
  )
}
