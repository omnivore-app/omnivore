import Head from 'next/head'
import { ErrorLayout } from '../components/templates/ErrorLayout'
import { EmptyLayout } from '../components/templates/EmptyLayout'

export default function Custom404(): JSX.Element {
  return (
    <>
      <Head>
        <title>Page Not Found</title>
      </Head>
      <EmptyLayout title="Page could not be found">
        <ErrorLayout statusCode={404} message="This page could not be found." />
      </EmptyLayout>
    </>
  )
}
