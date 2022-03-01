import { ErrorLayout } from '../components/templates/ErrorLayout'
import Head from 'next/head'
import { SettingsLayout } from '../components/templates/SettingsLayout'

export default function Custom500(): JSX.Element {
  return (
    <>
      <Head>
        <title>An unknown error occurred.</title>
      </Head>
      <SettingsLayout title="An unknown error occurred">
       <ErrorLayout statusCode={404} message="An unknown error occurred." />
      </SettingsLayout>
    </>
  )
}
