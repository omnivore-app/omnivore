import Head from 'next/head'
import { useRouter } from 'next/router'
import { ErrorLayout } from '../components/templates/ErrorLayout'
import { SettingsLayout } from '../components/templates/SettingsLayout'

export default function Custom404(): JSX.Element {
  return (
    <>
      <Head>
        <title>Page Not Found</title>
      </Head>
      <SettingsLayout>
       <ErrorLayout statusCode={404} message="This page could not be found." />
      </SettingsLayout>
    </>
  )
}
