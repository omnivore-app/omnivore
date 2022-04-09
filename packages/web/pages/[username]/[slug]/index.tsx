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
import { EditLabelsModal } from '../../../components/templates/article/EditLabelsModal'
import { Label } from '../../../lib/networking/fragments/labelFragment'
import { isVipUser } from '../../../lib/featureFlag'
import { styled, theme } from '../../../components/tokens/stitches.config'
import { Button } from '../../../components/elements/Button'
import { ArchiveBox, DotsThree, HighlighterCircle, TagSimple, TextAa } from 'phosphor-react'
import { Separator } from '@radix-ui/react-separator'
import { Article } from '../../../components/templates/article/Article'
import { ArticleActionsMenu } from '../../../components/templates/article/ArticleActionsMenu'
import { HighlightsModal } from '../../../components/templates/article/HighlightsModal'
import { setLinkArchivedMutation } from '../../../lib/networking/mutations/setLinkArchivedMutation'

const MenuSeparator = styled(Separator, {
  width: '100%',
  margin: 0,
  backgroundColor: 'red',
  borderBottom: `1px solid ${theme.colors.grayLine.toString()}`,
  my: '8px',
})

const PdfArticleContainerNoSSR = dynamic<PdfArticleContainerProps>(
  () => import('./../../../components/templates/article/PdfArticleContainer'),
  { ssr: false }
)

export default function Home(): JSX.Element {
  const router = useRouter()
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const { slug } = router.query
  const [showLabelsModal, setShowLabelsModal] = useState(false)
  const [showHighlightsModal, setShowHighlightsModal] = useState(false)

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
  const [marginWidth, setMarginWidth] = useState(preferencesData?.margin ?? 360)

  useKeyboardShortcuts(navigationCommands(router))

  const updateFontSize = async (newFontSize: number) => {
    setFontSize(newFontSize)
    await userPersonalizationMutation({ fontSize: newFontSize })
  }

  const updateMarginWidth = async (newMargin: number) => {
    console.log('margin', newMargin)
    setMarginWidth(newMargin)
  }

  const actionHandler = async (action: string, arg?: number) => {
    switch (action) {
      case 'archive':
        if (article) {
          await setLinkArchivedMutation({
            linkId: article.id,
            archived: true,
          })
          // TODO: merge from article actions PR
          // removeItemFromCache(cache, mutate, props.article.id)
          router.push(`/home`)
        }
        break
      case 'openOriginalArticle':
        const url = article?.url
        if (url) {
          window.open(url, '_blank')
        }
        break
      case 'showHighlights':
        setShowHighlightsModal(true)
        break
      case 'incrementFontSize':
        await updateFontSize(Math.min(fontSize + 2, 28))
        break
      case 'decrementFontSize':
        await updateFontSize(Math.max(fontSize - 2, 10))
        break
      case 'incrementMarginWidth':
        updateMarginWidth(Math.min(marginWidth + 50, 560))
        break
      case 'decrementMarginWidth':
        updateMarginWidth(Math.max(marginWidth - 50, 200))
        break
      case 'editLabels':
        if (viewerData?.me && isVipUser(viewerData?.me)) {
          setShowLabelsModal(true)
        }
        break
    }
  };

  useKeyboardShortcuts(
    articleKeyboardCommands(router, async (action) => {
      actionHandler(action)
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

        <VStack distribution="between" alignment="center" css={{
          position: 'fixed',
          flexDirection: 'row-reverse',
          top: '-120px',
          left: 8,
          height: '100%',
          width: '48px',
          '@lgDown': {
            display: 'none',
          },
          }}
        >
          <ArticleActionsMenu
            layout='vertical'
            articleActionHandler={actionHandler}
          />
        </VStack>
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
            css={{
              '@smDown': {
                background: theme.colors.grayBg.toString(),
              }
            }}
            >
              <ArticleContainer
                article={article}
                scrollElementRef={scrollRef}
                isAppleAppEmbed={false}
                highlightBarDisabled={false}
                highlightsBaseURL={`${webBaseURL}/${viewerData.me?.profile?.username}/${slug}/highlights`}
                fontSize={fontSize}
                margin={marginWidth}
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
            {showHighlightsModal && (
              <HighlightsModal
                highlights={article.highlights}
                onOpenChange={() => setShowHighlightsModal(false)}
                deleteHighlightAction={(highlightId: string) => {
                  // removeHighlightCallback(highlightId)
                }}
              />
            )}
              {/* {showLabelsModal && (
                <EditLabelsModal
                  labels={article.labels || []}
                  article={article}
                  onOpenChange={() => {
                    setShowLabelsModal(false)
                  }}
                  setLabels={(labels: Label[]) => {
                    // setLabels(labels)
                  }}
                />
              )} */}
      </PrimaryLayout>
    )
  }

  return <LoadingView />
}
