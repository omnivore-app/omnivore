/* eslint-disable @typescript-eslint/no-explicit-any */
import NextErrorComponent from 'next/error'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'

const MyError = ({ statusCode, hasGetInitialPropsRun, err }: any) => {
  const queryClient = useQueryClient()
  useEffect(() => {
    console.log('unhandled exception occurred, clearing cached data.')
    queryClient.clear()
  }, [])

  if (!hasGetInitialPropsRun && err) {
    // getInitialProps is not called in case of
    // https://github.com/vercel/next.js/issues/8592. As a workaround, we pass
    // err via _app.js so it can be captured
    Sentry.captureException(err)
    // Flushing is not required in this case as it only happens on the client
  }

  return <NextErrorComponent statusCode={statusCode} />
}

MyError.getInitialProps = async (context: any) => {
  const errorInitialProps: any = await NextErrorComponent.getInitialProps(
    context
  )

  const { res, err, asPath } = context

  // Workaround for https://github.com/vercel/next.js/issues/8592, mark when
  // getInitialProps has run
  errorInitialProps.hasGetInitialPropsRun = true

  // Returning early because we don't want to log 404 errors to Sentry.
  if (res?.statusCode === 404) {
    return errorInitialProps
  }

  await Sentry.captureUnderscoreErrorException(context)

  return errorInitialProps
}

export default MyError
