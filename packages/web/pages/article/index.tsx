import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import TopBarProgress from 'react-topbar-progress-indicator'
import { VStack } from '../../components/elements/LayoutPrimitives'
import { ArticleActionsMenu } from '../../components/templates/article/ArticleActionsMenu'
import { SkeletonArticleContainer } from '../../components/templates/article/SkeletonArticleContainer'
import { PrimaryLayout } from '../../components/templates/PrimaryLayout'
import { Loader } from '../../components/templates/SavingRequest'
import { theme } from '../../components/tokens/stitches.config'
import { useReaderSettings } from '../../lib/hooks/useReaderSettings'
import { applyStoredTheme } from '../../lib/themeUpdater'
import { PrimaryContent } from '../article/sr/[id]'

export default function ArticleSavingRequestPage(): JSX.Element {
  const router = useRouter()
  const readerSettings = useReaderSettings()
  const [url, setUrl] = useState<string | undefined>(undefined)

  applyStoredTheme()

  useEffect(() => {
    if (!router.isReady) return
    setUrl(router.query.url as string)
  }, [router.isReady, router.query.url])

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
          {url ? <PrimaryContent url={url} /> : <Loader />}
        </SkeletonArticleContainer>
      </VStack>
    </PrimaryLayout>
  )
}
