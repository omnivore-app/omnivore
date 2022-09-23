import { Box } from '../../elements/LayoutPrimitives'
import { useReadingProgressAnchor } from '../../../lib/hooks/useReadingProgressAnchor'
import {
  ScrollOffsetChangeset,
  useScrollWatcher,
} from '../../../lib/hooks/useScrollWatcher'
import {
  MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Tweet } from 'react-twitter-widgets'
import { render } from 'react-dom'
import { isDarkTheme } from '../../../lib/themeUpdater'
import debounce from 'lodash/debounce'
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

  const [readingAnchorIndex, setReadingAnchorIndex] = useState(
    props.initialAnchorIndex
  )

  const [shouldScrollToInitialPosition, setShouldScrollToInitialPosition] =
    useState(true)

  const articleContentRef = useRef<HTMLDivElement | null>(null)

  useReadingProgressAnchor(articleContentRef, setReadingAnchorIndex)

  const debouncedSetReadingProgress = useMemo(
    () =>
      debounce((readingProgress: number) => {
        console.log('setReadingProgress', readingProgress)
        setReadingProgress(readingProgress)
      }, 2000),
    []
  )

  // Stop the invocation of the debounced function
  // after unmounting
  useEffect(() => {
    return () => {
      debouncedSetReadingProgress.cancel()
    }
  }, [])

  useEffect(() => {
    ;(async () => {
      if (!readingProgress) return
      await props.articleMutations.articleReadingProgressMutation({
        id: props.articleId,
        // round reading progress to 100% if more than that
        readingProgressPercent: readingProgress > 100 ? 100 : readingProgress,
        readingProgressAnchorIndex: readingAnchorIndex,
      })
    })()

    // We don't react to changes to readingAnchorIndex we
    // only care about the progress (scroll position) changed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.articleId, readingProgress])

  // Post message to webkit so apple app embeds get progress updates
  useEffect(() => {
    if (typeof window?.webkit != 'undefined') {
      window.webkit.messageHandlers.readingProgressUpdate?.postMessage({
        progress: readingProgress,
      })
    } else if (typeof window?.AndroidWebKitMessageHandler != 'undefined') {
      window.AndroidWebKitMessageHandler.handleMessage(
        JSON.stringify({ progress: readingProgress })
      )
    }
  }, [readingProgress])

  useScrollWatcher((changeset: ScrollOffsetChangeset) => {
    if (window && window.document.scrollingElement) {
      const newReadingProgress =
        window.scrollY / window.document.scrollingElement.scrollHeight
      const adjustedReadingProgress =
        newReadingProgress > 0.92 ? 1 : newReadingProgress
      debouncedSetReadingProgress(adjustedReadingProgress * 100)
    }
  }, 1000)

  const layoutImages = useCallback(
    (image: HTMLImageElement, container: HTMLDivElement | null) => {
      if (!container) return
      const containerWidth = container.clientWidth + 140

      if (!image.closest('blockquote, table')) {
        let imageWidth = parseFloat(image.getAttribute('width') || '')
        imageWidth = isNaN(imageWidth) ? image.naturalWidth : imageWidth

        if (imageWidth > containerWidth) {
          image.style.setProperty(
            'width',
            `${Math.min(imageWidth, containerWidth)}px`
          )
          image.style.setProperty('max-width', 'unset')
          image.style.setProperty('margin-left', `-${Math.round(140 / 2)}px`)
        }
      }
    },
    []
  )

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

  const onLoadImageHandler = useCallback(() => {
    const images = articleContentRef.current?.querySelectorAll('img')

    images?.forEach((image) => {
      layoutImages(image, articleContentRef.current)
    })
  }, [layoutImages])

  useEffect(() => {
    window.addEventListener('load', onLoadImageHandler)

    return () => {
      window.removeEventListener('load', onLoadImageHandler)
    }
  }, [onLoadImageHandler])

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
