import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Box } from '../../../../components/elements/LayoutPrimitives'
import { useGetArticleSavingStatus } from '../../../../lib/networking/queries/useGetArticleSavingStatus'
import { ErrorComponent } from '../../../../components/templates/SavingRequest'
import { useSWRConfig } from 'swr'
import { cacheArticle } from '../../../../lib/networking/queries/useGetArticleQuery'
import { PrimaryLayout } from '../../../../components/templates/PrimaryLayout'
import { applyStoredTheme } from '../../../../lib/themeUpdater'
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { StyledText } from '../../../../components/elements/StyledText'
import { theme } from '../../../../components/tokens/stitches.config'

export default function LinkRequestPage(): JSX.Element {
  applyStoredTheme(false) // false to skip server sync

  const router = useRouter()
  const [requestID, setRequestID] = useState<string | undefined>(undefined)
  const [username, setUsername] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (!router.isReady) return
    setRequestID(router.query.id as string)
    setUsername(router.query.username as string)
  }, [router.isReady, router.query.id, router.query.username])

  return (
    <PrimaryLayout
      pageMetaDataProps={{
        title: 'Retrieving article...',
        path: router.pathname,
      }}
      hideHeader={true}
      pageTestId={router.pathname}
    >
      <Box css={{ bg: '$grayBase', height: '100vh', width: '100vw', px: '16px' }}>
        {requestID && username ? (
          <PrimaryContent requestID={requestID} username={username} />
        ) : (
          <Loader />
        )}
      </Box>
    </PrimaryLayout>
  )
}

function Loader(): JSX.Element {
  return (
    <SkeletonTheme baseColor={theme.colors.grayText.toString()} highlightColor="#444">
      <div style={{ fontSize: 20, lineHeight: 2 }}>
        <StyledText style="boldHeadline"></StyledText>
        <p></p>
        <Skeleton count={3} />
        <p></p>
        <Skeleton count={2} />
        <p></p>
        <Skeleton count={5} />
        <p></p>
        <Skeleton count={5} />
      </div>
    </SkeletonTheme>
  )
}

type PrimaryContentProps = {
  requestID: string
  username: string
}

function PrimaryContent(props: PrimaryContentProps): JSX.Element {
  const router = useRouter()
  const { mutate } = useSWRConfig()
  const [timedOut, setTimedOut] = useState(false)

  const { successRedirectPath, article, error } = useGetArticleSavingStatus({
    id: props.requestID,
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
