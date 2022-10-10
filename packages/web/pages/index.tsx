import { LoadingView } from '../components/patterns/LoadingView'
import { useGetViewerQuery } from '../lib/networking/queries/useGetViewerQuery'
import { PageMetaData } from '../components/patterns/PageMetaData'
import { useRouter } from 'next/router'

export default function Home(): JSX.Element {
  const router = useRouter()
  const { viewerData, viewerDataError, isLoading } = useGetViewerQuery()

  if (!isLoading && router.isReady) {
    if (viewerDataError || !viewerData?.me) {
      router.push('/login')
      return <LoadingView />
    }

    if (viewerData?.me) {
      router.push('/home')
      return <LoadingView />
    }
  }

  return (
    <>
      <PageMetaData
        title="Omnivore"
        path="/"
        ogImage="/static/images/og-homepage.png"
      />
      <LoadingView />
    </>
  )
}
