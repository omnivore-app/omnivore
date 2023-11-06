import { useGetArticleQuery } from '../../../../lib/networking/queries/useGetArticleQuery'
import { Box, VStack } from './../../../../components/elements/LayoutPrimitives'
import { ArticleContainer } from './../../../../components/templates/article/ArticleContainer'
import { useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { webBaseURL } from '../../../../lib/appConfig'
import { LoadingView } from '../../../../components/patterns/LoadingView'
import { cookieValue } from '../../../../lib/cookieHelpers'
import { applyStoredTheme } from '../../../../lib/themeUpdater'
import { createHighlightMutation } from '../../../../lib/networking/mutations/createHighlightMutation'
import { deleteHighlightMutation } from '../../../../lib/networking/mutations/deleteHighlightMutation'
import { mergeHighlightMutation } from '../../../../lib/networking/mutations/mergeHighlightMutation'
import { updateHighlightMutation } from '../../../../lib/networking/mutations/updateHighlightMutation'
import { articleReadingProgressMutation } from '../../../../lib/networking/mutations/articleReadingProgressMutation'
import Script from 'next/script'
import { useGetViewerQuery } from '../../../../lib/networking/queries/useGetViewerQuery'

type AppArticleEmbedContentProps = {
  slug: string
  username: string
  highlightBarDisabled: boolean
  fontSize: number
  margin: number
  fontFamily: string
}

export default function AppArticleEmbed(): JSX.Element {
  applyStoredTheme(false) // false to skip server sync

  const router = useRouter()

  const [contentProps, setContentProps] = useState<
    AppArticleEmbedContentProps | undefined
  >(undefined)

  useEffect(() => {
    if (!router.isReady) return
    const highlightBarDisabled =
      (router.query.highlightBarDisabled as string | undefined) ?? ''
    const articleProps = {
      slug: router.query.slug as string,
      username: router.query.username as string,
      highlightBarDisabled: highlightBarDisabled == 'true',
      fontSize: Number(cookieValue('fontSize', document.cookie) ?? '16'),
      margin: Number(cookieValue('margin', document.cookie) ?? '0'),
      fontFamily: cookieValue('fontFamily', document.cookie) ?? 'inter',
    }
    setContentProps(articleProps)
  }, [
    router.isReady,
    router.query.slug,
    router.query.username,
    router.query.highlightBarDisabled,
  ])

  if (contentProps) {
    return <AppArticleEmbedContent {...contentProps} />
  }

  return <LoadingView bgColor="#ffffff00" />
}

function AppArticleEmbedContent(
  props: AppArticleEmbedContentProps
): JSX.Element {
  const { viewerData } = useGetViewerQuery()
  const [showHighlightsModal, setShowHighlightsModal] = useState(false)

  const { articleData } = useGetArticleQuery({
    username: props.username,
    slug: props.slug,
    includeFriendsHighlights: false,
  })

  if (articleData && viewerData?.me) {
    return (
      <Box>
        <Script async src="/static/scripts/mathJaxConfiguration.js" />
        <Script async id="MathJax-script" src="/static/tex-mml-chtml.js" />
        <VStack
          alignment="center"
          distribution="center"
          className="disable-webkit-callout"
          css={{ paddingTop: '80px' }}
        >
          <ArticleContainer
            viewer={viewerData.me}
            article={articleData.article.article}
            isAppleAppEmbed={true}
            highlightBarDisabled={props.highlightBarDisabled}
            fontSize={props.fontSize}
            margin={props.margin}
            fontFamily={props.fontFamily}
            labels={[]}
            articleMutations={{
              createHighlightMutation,
              deleteHighlightMutation,
              mergeHighlightMutation,
              updateHighlightMutation,
              articleReadingProgressMutation,
            }}
          />
        </VStack>
      </Box>
    )
  }

  return <LoadingView bgColor="#ffffff00" />
}
