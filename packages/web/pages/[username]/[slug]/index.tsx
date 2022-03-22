import { PrimaryLayout } from '../../../components/templates/PrimaryLayout'
import { LoadingView } from '../../../components/patterns/LoadingView'
import { useGetViewerQuery } from '../../../lib/networking/queries/useGetViewerQuery'
import { useGetArticleQuery } from '../../../lib/networking/queries/useGetArticleQuery'
import { useRouter } from 'next/router'
import { VStack } from './../../../components/elements/LayoutPrimitives'
import { ArticleContainer } from './../../../components/templates/article/ArticleContainer'
import { PdfArticleContainerProps } from './../../../components/templates/article/PdfArticleContainer'
import { useRef } from 'react'
import { useKeyboardShortcuts } from '../../../lib/keyboardShortcuts/useKeyboardShortcuts'
import { navigationCommands } from '../../../lib/keyboardShortcuts/navigationShortcuts'
import dynamic from 'next/dynamic'
import { useGetUserPreferences } from '../../../lib/networking/queries/useGetUserPreferences'
import { webBaseURL } from '../../../lib/appConfig'
import { Toaster } from 'react-hot-toast'

const PdfArticleContainerNoSSR = dynamic<PdfArticleContainerProps>(
  () => import('./../../../components/templates/article/PdfArticleContainer'),
  { ssr: false }
)

export default function Home(): JSX.Element {
  const router = useRouter()
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const { slug } = router.query

  // Populate data cache
  const { viewerData } = useGetViewerQuery()
  const { articleData } = useGetArticleQuery({
    username: router.query.username as string,
    slug: router.query.slug as string,
    includeFriendsHighlights: false,
  })
  const { preferencesData } = useGetUserPreferences()
  const article = articleData?.article.article

  useKeyboardShortcuts(navigationCommands(router))

  if (article && viewerData?.me) {
    return (
      <PrimaryLayout
        pageTestId="home-page-tag"
        scrollElementRef={scrollRef}
        displayFontStepper={true}
        pageMetaDataProps={{
          title: article.title,
          path: router.pathname,
          description: article.description,
        }}
      >
        <Toaster />

          {article.contentReader == 'PDF' ? (
            <PdfArticleContainerNoSSR
              article={article}
              viewerUsername={viewerData.me?.profile?.username}
            />
          ) : (
            <VStack
            alignment="center"
            distribution="center"
            ref={scrollRef}
            className="disable-webkit-callout"
            >
              <ArticleContainer
                article={article}
                scrollElementRef={scrollRef}
                isAppleAppEmbed={false}
                highlightBarDisabled={false}
                fontSize={preferencesData?.fontSize}
              />
            </VStack>
          )}
      </PrimaryLayout>
    )
  }

  return <LoadingView />
}
