import { useGetArticleQuery } from '../../../../lib/networking/queries/useGetArticleQuery'
import { Box, VStack } from './../../../../components/elements/LayoutPrimitives'
import { ArticleContainer } from './../../../../components/templates/article/ArticleContainer'
import { useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { webBaseURL } from '../../../../lib/appConfig'
import { LoadingView } from '../../../../components/patterns/LoadingView'
import { cookieValue } from '../../../../lib/cookieHelpers'
import { applyStoredTheme } from '../../../../lib/themeUpdater'

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
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const { articleData } = useGetArticleQuery({
    username: props.username,
    slug: props.slug,
    includeFriendsHighlights: false,
  })

  if (articleData) {
    return (
      <Box
        ref={scrollRef}
        css={{
          overflowY: 'auto',
          height: '100%',
          width: '100vw',
        }}
      >
        <VStack
          alignment="center"
          distribution="center"
          className="disable-webkit-callout"
        >
          <ArticleContainer
            article={articleData.article.article}
            scrollElementRef={scrollRef}
            isAppleAppEmbed={true}
            highlightBarDisabled={props.highlightBarDisabled}
            viewerUsername={props.username}
            highlightsBaseURL={`${webBaseURL}/${props.username}/${props.slug}/highlights`}
            fontSize={props.fontSize}
            margin={props.margin}
            fontFamily={props.fontFamily}
          />
        </VStack>
      </Box>
    )
  }

  return <LoadingView bgColor="#ffffff00" />
}
