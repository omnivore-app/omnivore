import { Box } from './../../../components/elements/LayoutPrimitives'
import { useReadingProgressAnchor } from '../../../lib/hooks/useReadingProgressAnchor'
import {
  useScrollWatcher,
  ScrollOffsetChangeset,
} from '../../../lib/hooks/useScrollWatcher'
import {
  useRef,
  useState,
  useEffect,
  MutableRefObject,
  useCallback,
} from 'react'
import { articleReadingProgressMutation } from '../../../lib/networking/mutations/articleReadingProgressMutation'
import { Tweet } from 'react-twitter-widgets'
import { render } from 'react-dom'
import { isDarkTheme } from '../../../lib/themeUpdater'
import useDebounce from '../../../lib/hooks/useDebounce'

export type ArticleProps = {
  articleId: string
  content: string
  initialAnchorIndex: number
  initialReadingProgress?: number
  scrollElementRef: MutableRefObject<HTMLDivElement | null>
}

export function Article(props: ArticleProps): JSX.Element {
  const highlightTheme = isDarkTheme() ? 'dark' : 'default'

  const [readingProgress, setReadingProgress] = useState(
    props.initialReadingProgress || 0
  )

  const [readingAnchorIndex, setReadingAnchorIndex] = useState(
    props.initialAnchorIndex
  )

  const [shouldScrollToInitialPosition, setShouldScrollToInitialPosition] =
    useState(true)

  const articleContentRef = useRef<HTMLDivElement | null>(null)

  useReadingProgressAnchor(articleContentRef, setReadingAnchorIndex)

  const debouncedReadingProgress = useDebounce(readingProgress, 1000)
  const debouncedReadingAnchorIndex = useDebounce(readingAnchorIndex, 1000)

  useEffect(() => {
    ;(async () => {
      await articleReadingProgressMutation({
        id: props.articleId,
        readingProgressPercent: debouncedReadingProgress,
        readingProgressAnchorIndex: readingAnchorIndex,
      })
    })()
  }, [
    props.articleId,
    debouncedReadingProgress,
    debouncedReadingAnchorIndex,
    readingAnchorIndex,
  ])

  // Post message to webkit so apple app embeds get progress updates
  useEffect(() => {
    window?.webkit?.messageHandlers.readingProgressUpdate?.postMessage({
      progress: debouncedReadingProgress,
    })
  }, [debouncedReadingProgress])

  const setScrollWatchedElement = useScrollWatcher(
    (changeset: ScrollOffsetChangeset) => {
      const scrollContainer = props.scrollElementRef.current
      if (scrollContainer) {
        const newReadingProgress =
          (changeset.current.y + scrollContainer.clientHeight) /
          scrollContainer.scrollHeight

        setReadingProgress(newReadingProgress * 100)
      }
    },
    1000
  )

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

  useEffect(() => {
    setScrollWatchedElement(props.scrollElementRef.current)
  }, [props.scrollElementRef, setScrollWatchedElement])

  // Scroll to initial anchor position
  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    if (!shouldScrollToInitialPosition) {
      return
    }

    setShouldScrollToInitialPosition(false)

    if (props.initialReadingProgress && props.initialReadingProgress >= 98) {
      return
    }

    const anchorElement = document.querySelector(
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

      props.scrollElementRef.current?.scroll(0, calculateOffset(anchorElement))
    }
  }, [
    props.initialAnchorIndex,
    props.initialReadingProgress,
    props.scrollElementRef,
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
        dangerouslySetInnerHTML={{
          __html: props.content,
        }}
      />
    </>
  )
}
