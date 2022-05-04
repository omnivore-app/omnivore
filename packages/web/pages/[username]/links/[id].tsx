import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { PrimaryLayout } from '../../../components/templates/PrimaryLayout'
import {
  ErrorComponent,
  Loader,
} from '../../../components/templates/SavingRequest'
import { ArticleActionsMenu } from '../../../components/templates/article/ArticleActionsMenu'
import { VStack } from '../../../components/elements/LayoutPrimitives'
import { theme } from '../../../components/tokens/stitches.config'
import { applyStoredTheme } from '../../../lib/themeUpdater'
import { useReaderSettings } from '../../../lib/hooks/useReaderSettings'
import { SkeletonArticleContainer } from '../../../components/templates/article/SkeletonArticleContainer'
import TopBarProgress from 'react-topbar-progress-indicator'
import { useGetArticleQuery } from '../../../lib/networking/queries/useGetArticleQuery'

export default function ArticleSavingRequestPage(): JSX.Element {
  const router = useRouter()
  const readerSettings = useReaderSettings()
  const [articleId, setArticleId] = useState<string | undefined>(undefined)

  applyStoredTheme(false)

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
          lineHeight={readerSettings.lineHeight}
          marginWidth={readerSettings.marginWidth}
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
          lineHeight={readerSettings.lineHeight}
          marginWidth={readerSettings.marginWidth}
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
          {articleId ? (
            <PrimaryContent
              articleId={articleId}
              username={router.query.username as string}
            />
          ) : (
            <Loader />
          )}
        </SkeletonArticleContainer>
      </VStack>
    </PrimaryLayout>
  )
}

type PrimaryContentProps = {
  articleId: string
  username: string
}

function PrimaryContent(props: PrimaryContentProps): JSX.Element {
  const router = useRouter()
  const [timedOut, setTimedOut] = useState(false)

  const { articleData, articleFetchError } = useGetArticleQuery({
    username: props.username,
    slug: props.articleId,
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimedOut(true)
    }, 30000)

    return () => {
      clearTimeout(timer)
    }
  }, [])

  if (articleFetchError === 'Unauthorized') {
    router.replace('/login')
  }

  if (timedOut || articleFetchError) {
    return (
      <ErrorComponent errorMessage="Something went wrong while processing the link, please try again in a moment" />
    )
  }

  if (articleData && articleData.article.article.state === 'SUCCEEDED') {
    router.replace(`/${props.username}/${articleData.article.article.slug}`)
  }

  return <Loader />
}
