import { Box } from '../../elements/LayoutPrimitives'
import {
  getTopOmnivoreAnchorElement,
  useReadingProgressAnchor,
} from '../../../lib/hooks/useReadingProgressAnchor'
import {
  ScrollOffsetChangeset,
  useScrollWatcher,
} from '../../../lib/hooks/useScrollWatcher'
import { MutableRefObject, useEffect, useMemo, useRef, useState } from 'react'
import { Tweet } from 'react-twitter-widgets'
import { render } from 'react-dom'
import { isDarkTheme } from '../../../lib/themeUpdater'
import { ArticleMutations } from '../../../lib/articleActions'

export type ArticleProps = {
  articleId: string
  content: string
  initialAnchorIndex: number
  initialReadingProgress?: number
  highlightHref: MutableRefObject<string | null>
  articleMutations: ArticleMutations
}

export function Article(props: ArticleProps): JSX.Element {
  const highlightTheme = isDarkTheme() ? 'dark' : 'default'

  const [readingProgress, setReadingProgress] = useState(
    props.initialReadingProgress
  )

  const [shouldScrollToInitialPosition, setShouldScrollToInitialPosition] =
    useState(true)

  const articleContentRef = useRef<HTMLDivElement | null>(null)

  const clampToPercent = (float: number) => {
    return Math.floor(Math.max(0, Math.min(100, float)))
  }

  useEffect(() => {
    ;(async () => {
      if (!readingProgress) return
      if (!articleContentRef.current) return
      if (!window.document.scrollingElement) return
      const anchor = getTopOmnivoreAnchorElement(articleContentRef.current)
      const topPositionPercent =
        window.scrollY / window.document.scrollingElement.scrollHeight
      const anchorIndex = Number(anchor)

      await props.articleMutations.articleReadingProgressMutation({
        id: props.articleId,
        readingProgressPercent: clampToPercent(readingProgress),
        readingProgressTopPercent: clampToPercent(topPositionPercent * 100),
        readingProgressAnchorIndex:
          anchorIndex == Number.NaN ? undefined : anchorIndex,
      })
    })()

    // We don't react to changes to readingAnchorIndex we
    // only care about the progress (scroll position) changed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.articleId, readingProgress])

  // Post message to webkit so apple app embeds get progress updates
  // TODO: verify if ios still needs this code...seeems to be duplicated
  useEffect(() => {
    if (typeof window?.webkit != 'undefined') {
      window.webkit.messageHandlers.readingProgressUpdate?.postMessage({
        progress: readingProgress,
      })
    }
  }, [readingProgress])

  useScrollWatcher((changeset: ScrollOffsetChangeset) => {
    if (window && window.document.scrollingElement) {
      const bottomProgress =
        (window.scrollY + window.document.scrollingElement.clientHeight) /
        window.document.scrollingElement.scrollHeight

      setReadingProgress(bottomProgress * 100)
    }
  }, 2500)

  // Scroll to initial anchor position
  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    if (!shouldScrollToInitialPosition) {
      return
    }

    setShouldScrollToInitialPosition(false)

    // If we are scrolling to a highlight, dont scroll to read position
    if (props.highlightHref.current) {
      return
    }

    if (props.initialReadingProgress && props.initialReadingProgress >= 98) {
      return
    }

    const anchorElement = props.highlightHref.current
      ? document.querySelector(
          `[omnivore-highlight-id="${props.highlightHref.current}"]`
        )
      : document.querySelector(
          `[data-omnivore-anchor-idx='${props.initialAnchorIndex.toString()}']`
        )

    if (anchorElement) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const calculateOffset = (obj: any): number => {
        let offset = 0
        if (obj.offsetParent) {
          do {
            offset += obj.offsetTop
          } while ((obj = obj.offsetParent))
          return offset
        }

        return 0
      }

      const calculatedOffset = calculateOffset(anchorElement)
      window.document.documentElement.scroll(0, calculatedOffset - 100)
    }
  }, [
    props.initialAnchorIndex,
    props.initialReadingProgress,
    shouldScrollToInitialPosition,
  ])

  useEffect(() => {
    if (typeof window?.MathJax?.typeset === 'function') {
      window.MathJax.typeset()
    }

    const tweets = Array.from(
      document.getElementsByClassName('tweet-placeholder')
    )

    tweets.forEach((tweet) => {
      render(
        <Tweet
          tweetId={tweet.getAttribute('data-tweet-id') || ''}
          options={{
            theme: isDarkTheme() ? 'dark' : 'light',
            align: 'center',
          }}
        />,
        tweet
      )
    })
  }, [])

  return (
    <>
      <link
        rel="stylesheet"
        href={`https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.4.0/styles/${highlightTheme}.min.css`}
      />
      <Box
        ref={articleContentRef}
        css={{
          maxWidth: '100%',
        }}
        className="article-inner-css"
        data-testid="article-inner"
        dangerouslySetInnerHTML={{
          __html: props.content,
        }}
      />
    </>
  )
}
