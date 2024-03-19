import { ErrorLayout } from '../components/templates/ErrorLayout'
import Head from 'next/head'
import { EmptyLayout } from '../components/templates/EmptyLayout'

export default function Custom500(): JSX.Element {
  return (
    <>
      <Head>
        <title>An unknown error occurred.</title>
      </Head>
      <EmptyLayout title="An unknown error occurred">
        <ErrorLayout statusCode={404} message="An unknown error occurred." />
      </EmptyLayout>
    </>
  )
}
