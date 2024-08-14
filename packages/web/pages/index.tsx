import { useGetViewerQuery } from '../lib/networking/queries/useGetViewerQuery'
import { useRouter } from 'next/router'
import { PageMetaData } from '../components/patterns/PageMetaData'
import { LoadingView } from '../components/patterns/LoadingView'
import { About } from '../components/templates/About'
import { DEFAULT_HOME_PATH } from '../lib/navigations'
import { useGetViewer } from '../lib/networking/viewer/useGetViewer'

export default function LandingPage(): JSX.Element {
  const router = useRouter()
  const { data: viewerData, isLoading } = useGetViewer()

  if (!isLoading && router.isReady && viewerData) {
    const navReturn = window.localStorage.getItem('nav-return')
    if (navReturn) {
      router.push(navReturn)
    } else {
      router.push(DEFAULT_HOME_PATH)
    }
    return <></>
  } else if (isLoading || !router.isReady) {
    return (
      <>
        <PageMetaData
          title="Omnivore"
          path="/"
          ogImage="/static/images/og-homepage-03.png"
          description="Omnivore is the free, open source, read-it-later app for serious readers."
        />
        <LoadingView bgColor="#FEFCF5" />
      </>
    )
  }

  return (
    <>
      <PageMetaData
        title="Omnivore"
        path="/"
        ogImage="/static/images/og-homepage-03.png"
        description="Omnivore is the free, open source, read-it-later app for serious readers."
      />

      <About lang="en" />
    </>
  )
}
