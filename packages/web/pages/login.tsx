import { useRouter } from 'next/router'
import Script from 'next/script'
import Head from 'next/head'
import { useState, useEffect } from 'react'
import { LoginLayout } from './../components/templates/LoginLayout'
import { parseErrorCodes } from '../lib/queryParamParser'
import { PageMetaData } from '../components/patterns/PageMetaData'
import { formatMessage } from '../locales/en/messages'

export default function Login(): JSX.Element {
  const router = useRouter()
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  )

  useEffect(() => {
    if (!router.isReady) return
    const errorCode = parseErrorCodes(router.query)
    const message = errorCode
      ? formatMessage({ id: `error.${errorCode}` })
      : undefined
    setErrorMessage(message)
    console.log('error message', message)
  }, [router.isReady, router.query])

  const loginFormProps = {
    waitlistButtonClickHander: () => {
      router.push('/')
    },
    errorMessage,
  }

  return (
    <>
      <Head>
      </Head>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
      />
      <PageMetaData title="Welcome to Omnivore" path="/login" ogImage='/static/images/og-homepage.png' />
      <LoginLayout {...loginFormProps} />
      <div data-testid="login-page-tag" />
    </>
  )
}
