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

  applyStoredTheme(false)

  useEffect(() => {
    if (!router.isReady) return
    setUrl(router.query.url as string)
  }, [router.isReady, router.query.url])

  return (
    <PrimaryLayout
      pageTestId="home-page-tag"
      alwaysDisplayToolbar={false}
      pageMetaDataProps={{
        title: 'Saving link',
        path: router.pathname,
      }}
    >
      <TopBarProgress />
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
