import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import TopBarProgress from 'react-topbar-progress-indicator'
import { VStack } from '../../../components/elements/LayoutPrimitives'
import { ArticleActionsMenu } from '../../../components/templates/article/ArticleActionsMenu'
import { SkeletonArticleContainer } from '../../../components/templates/article/SkeletonArticleContainer'
import { PrimaryLayout } from '../../../components/templates/PrimaryLayout'
import {
  ErrorComponent,
  Loader,
} from '../../../components/templates/SavingRequest'
import { theme } from '../../../components/tokens/stitches.config'
import { useReaderSettings } from '../../../lib/hooks/useReaderSettings'
import { useGetArticleSavingStatus } from '../../../lib/networking/queries/useGetArticleSavingStatus'
import { applyStoredTheme } from '../../../lib/themeUpdater'
import { ReaderHeader } from '../../../components/templates/reader/ReaderHeader'

export default function ArticleSavingRequestPage(): JSX.Element {
  const router = useRouter()
  const readerSettings = useReaderSettings()
  const [articleId, setArticleId] = useState<string | undefined>(undefined)

  applyStoredTheme()

  useEffect(() => {
    if (!router.isReady) return
    setArticleId(router.query.id as string)
  }, [router.isReady, router.query.id])

  return (
    <PrimaryLayout
      pageTestId="home-page-tag"
      headerToolbarControl={
        <ArticleActionsMenu
          article={undefined}
          layout="top"
          readerSettings={readerSettings}
          showReaderDisplaySettings={true}
          articleActionHandler={readerSettings.actionHandler}
        />
      }
      alwaysDisplayToolbar={false}
      pageMetaDataProps={{
        title: 'Saving link',
        path: router.pathname,
      }}
    >
      <ReaderHeader
        alwaysDisplayToolbar={false}
        hideDisplaySettings={true}
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        showDisplaySettingsModal={() => {}}
      />
      <TopBarProgress />
      <VStack
        distribution="between"
        alignment="center"
        css={{
          position: 'fixed',
          flexDirection: 'row-reverse',
          top: '-120px',
          left: 8,
          height: '100%',
          width: '35px',
          '@lgDown': {
            display: 'none',
          },
        }}
      >
        <ArticleActionsMenu
          article={undefined}
          layout="side"
          readerSettings={readerSettings}
          showReaderDisplaySettings={true}
          articleActionHandler={readerSettings.actionHandler}
        />
      </VStack>
      <VStack
        alignment="center"
        distribution="center"
        className="disable-webkit-callout"
        css={{
          '@smDown': {
            background: theme.colors.grayBg.toString(),
          },
        }}
      >
        <SkeletonArticleContainer
          margin={readerSettings.marginWidth}
          fontSize={readerSettings.fontSize}
          lineHeight={readerSettings.lineHeight}
        >
          {articleId ? <PrimaryContent articleId={articleId} /> : <Loader />}
        </SkeletonArticleContainer>
      </VStack>
    </PrimaryLayout>
  )
}

type PrimaryContentProps = {
  articleId?: string
  url?: string
}

export function PrimaryContent(props: PrimaryContentProps): JSX.Element {
  const router = useRouter()
  const [timedOut, setTimedOut] = useState(false)

  const { successRedirectPath, error } = useGetArticleSavingStatus({
    id: props.articleId,
    url: props.url,
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimedOut(true)
    }, 30000)

    return () => {
      clearTimeout(timer)
    }
  }, [])

  if (error === 'unauthorized') {
    router.replace('/login')
  }

  if (timedOut) {
    return (
      <ErrorComponent errorMessage="Something went wrong while processing the link, please try again in a moment" />
    )
  }

  if (successRedirectPath) {
    router.replace(successRedirectPath)
  }

  return <Loader />
}
