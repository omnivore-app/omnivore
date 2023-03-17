import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useSWRConfig } from 'swr'
import { Box } from '../../../../components/elements/LayoutPrimitives'
import { PrimaryLayout } from '../../../../components/templates/PrimaryLayout'
import { ErrorComponent } from '../../../../components/templates/SavingRequest'
import { cacheArticle } from '../../../../lib/networking/queries/useGetArticleQuery'
import { useGetArticleSavingStatus } from '../../../../lib/networking/queries/useGetArticleSavingStatus'
import { applyStoredTheme } from '../../../../lib/themeUpdater'

export default function LinkRequestPage(): JSX.Element {
  applyStoredTheme(false) // false to skip server sync

  const router = useRouter()
  const [url, setUrl] = useState<string | undefined>(undefined)
  const [username, setUsername] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (!router.isReady) return
    setUrl(router.query.url as string)
    setUsername(router.query.username as string)
  }, [router.isReady, router.query.url, router.query.username])

  return (
    <PrimaryLayout
      pageMetaDataProps={{
        title: 'Retrieving article...',
        path: router.pathname,
      }}
      hideHeader={true}
      pageTestId={router.pathname}
    >
      <Box
        css={{ bg: '$grayBase', height: '100vh', width: '100vw', px: '16px' }}
      >
        {url && username ? (
          <PrimaryContent url={url} username={username} />
        ) : (
          <Loader />
        )}
      </Box>
    </PrimaryLayout>
  )
}

function Loader(): JSX.Element {
  return <Box />
}

type PrimaryContentProps = {
  url: string
  username: string
}

function PrimaryContent(props: PrimaryContentProps): JSX.Element {
  const router = useRouter()
  const { mutate } = useSWRConfig()
  const [timedOut, setTimedOut] = useState(false)

  const { successRedirectPath, article, error } = useGetArticleSavingStatus({
    url: props.url,
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimedOut(true)
    }, 10 * 1000)

    return () => {
      clearTimeout(timer)
    }
  }, [])

  if (error === 'unauthorized') {
    router.replace('/login')
  }

  if (timedOut || error) {
    return (
      <ErrorComponent errorMessage="Something went wrong while processing and your link could not be saved. Please try again later." />
    )
  }

  if (article) {
    cacheArticle(mutate, props.username, article)
  }

  if (successRedirectPath) {
    router.replace(
      `/app${successRedirectPath}?isAppEmbedView=true&highlightBarDisabled=true`
    )
  }

  return <Loader />
}
