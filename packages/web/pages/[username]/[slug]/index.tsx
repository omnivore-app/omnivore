import { PrimaryLayout } from '../../../components/templates/PrimaryLayout'
import { LoadingView } from '../../../components/patterns/LoadingView'
import { useGetViewerQuery } from '../../../lib/networking/queries/useGetViewerQuery'
import { useGetArticleQuery } from '../../../lib/networking/queries/useGetArticleQuery'
import { useRouter } from 'next/router'
import { VStack } from './../../../components/elements/LayoutPrimitives'
import { ArticleContainer } from './../../../components/templates/article/ArticleContainer'
import { PdfArticleContainerProps } from './../../../components/templates/article/PdfArticleContainer'
import { useRef, useState } from 'react'
import { useKeyboardShortcuts } from '../../../lib/keyboardShortcuts/useKeyboardShortcuts'
import { articleKeyboardCommands, navigationCommands } from '../../../lib/keyboardShortcuts/navigationShortcuts'
import dynamic from 'next/dynamic'
import { useGetUserPreferences } from '../../../lib/networking/queries/useGetUserPreferences'
import { webBaseURL } from '../../../lib/appConfig'
import { Toaster } from 'react-hot-toast'
import { createHighlightMutation } from '../../../lib/networking/mutations/createHighlightMutation'
import { deleteHighlightMutation } from '../../../lib/networking/mutations/deleteHighlightMutation'
import { mergeHighlightMutation } from '../../../lib/networking/mutations/mergeHighlightMutation'
import { articleReadingProgressMutation } from '../../../lib/networking/mutations/articleReadingProgressMutation'
import { updateHighlightMutation } from '../../../lib/networking/mutations/updateHighlightMutation'
import { userPersonalizationMutation } from '../../../lib/networking/mutations/userPersonalizationMutation'
import Script from 'next/script'

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
  const [fontSize, setFontSize] = useState(preferencesData?.fontSize ?? 20)

  useKeyboardShortcuts(navigationCommands(router))

  const updateFontSize = async (newFontSize: number) => {
    setFontSize(newFontSize)
    await userPersonalizationMutation({ fontSize: newFontSize })
  }

  useKeyboardShortcuts(
    articleKeyboardCommands(router, async (action) => {
      switch (action) {
        case 'openOriginalArticle':
          const url = article?.url
          if (url) {
            window.open(url, '_blank')
          }
          break
        case 'incrementFontSize':
          await updateFontSize(Math.min(fontSize + 2, 28))
          break
        case 'decrementFontSize':
          await updateFontSize(Math.max(fontSize - 2, 10))
          break
        case 'editLabels':
          setShowLabelsModal(true)
          break
      }
    })
  )

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
        <Script async src="/static/scripts/mathJaxConfiguration.js" />
        <Script
          async
          id="MathJax-script"
          src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"
        />
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
                highlightsBaseURL={`${webBaseURL}/${viewerData.me?.profile?.username}/${slug}/highlights`}
                fontSize={fontSize}
                articleMutations={{
                  createHighlightMutation,
                  deleteHighlightMutation,
                  mergeHighlightMutation,
                  updateHighlightMutation,
                  articleReadingProgressMutation,
                }}
              />
            </VStack>
          )}
      </PrimaryLayout>
    )
  }

  return <LoadingView />
}
