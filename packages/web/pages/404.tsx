import { ErrorLayout } from '../components/templates/ErrorLayout'
import { Box } from '../components/elements/LayoutPrimitives'
import Head from 'next/head'

export default function Custom404(): JSX.Element {
  return (
    <Box
      css={{ bg: '$omnivoreYellow', height: '100vh', overflow: 'hidden', m: 0, p: 0 }}
    >
      <Head>
        <title>Page Not Found</title>
      </Head>
      <ErrorLayout statusCode={404} />;
    </Box>
  )
}
