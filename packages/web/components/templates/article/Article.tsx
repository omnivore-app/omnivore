import { Box, SpanBox } from '../../elements/LayoutPrimitives'
import {
  getTopOmnivoreAnchorElement,
  parseDomTree,
} from '../../../lib/anchorElements'
import { useScrollWatcher } from '../../../lib/hooks/useScrollWatcher'
import { MutableRefObject, useEffect, useMemo, useRef, useState } from 'react'
import { isDarkTheme } from '../../../lib/themeUpdater'
import { ArticleMutations } from '../../../lib/articleActions'
import { Lightbox, SlideImage } from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import Download from 'yet-another-react-lightbox/plugins/download'
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import Counter from 'yet-another-react-lightbox/plugins/counter'

import loadjs from 'loadjs'

export type ArticleProps = {
  articleId: string
  content: string
  initialAnchorIndex: number
  initialReadingProgress?: number
  initialReadingProgressTop?: number
  highlightHref: MutableRefObject<string | null>
  articleMutations: ArticleMutations
  isAppleAppEmbed: boolean
  containerRef?: MutableRefObject<HTMLDivElement | null>
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

  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [imageSrcs, setImageSrcs] = useState<SlideImage[]>([])
  const [lightboxIndex, setlightBoxIndex] = useState(0)

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

  useScrollWatcher(
    props.containerRef,
    () => {
      if (props.containerRef?.current) {
        const target = props.containerRef?.current
        const bottomProgress =
          (target.scrollTop + target.clientHeight) / target.scrollHeight

        console.log('bottom progress: ', bottomProgress)
        setReadingProgress(bottomProgress * 100)
      } else if (window && window.document.scrollingElement) {
        const bottomProgress =
          (window.scrollY + window.document.scrollingElement.clientHeight) /
          window.document.scrollingElement.scrollHeight

        setReadingProgress(bottomProgress * 100)
      }
    },
    2500
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

    parseDomTree(articleContentRef.current)

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

    const tweetPlaceholders = Array.from(
      document.getElementsByClassName('tweet-placeholder')
    )

    if (tweetPlaceholders.length > 0) {
      ;(async () => {
        const twScriptUrl = 'https://platform.twitter.com/widgets.js'
        const twScriptWindowFieldName = 'twttr'
        const twScriptName = twScriptWindowFieldName

        await new Promise((resolve, reject) => {
          if (!loadjs.isDefined(twScriptName)) {
            loadjs(twScriptUrl, twScriptName)
          }
          loadjs.ready(twScriptName, {
            success: () => {
              if (window.twttr?.widgets) {
                resolve(true)
              } else {
                resolve(false)
              }
            },
            error: () =>
              reject(new Error('Could not load remote twitter widgets js')),
          })
        })

        tweetPlaceholders.forEach((tweetPlaceholder) => {
          const tweetId = tweetPlaceholder.getAttribute('data-tweet-id')
          if (!tweetId) return
          window.twttr?.widgets?.createTweet(tweetId, tweetPlaceholder, {
            theme: isDarkTheme() ? 'dark' : 'light',
            align: 'center',
            dnt: 'true',
          })
        })
      })()
    }
  }, [])

  useEffect(() => {
    // Get all images with initial sizes, if they are small
    // make sure they get displayed small
    const sizedImages = Array.from(
      document.querySelectorAll('img[data-omnivore-width]')
    )

    sizedImages.forEach((element) => {
      const img = element as HTMLImageElement
      const width = Number(img.getAttribute('data-omnivore-width'))
      const height = Number(img.getAttribute('data-omnivore-height'))

      if (!isNaN(width) && !isNaN(height) && width < 100 && height < 100) {
        img.style.setProperty('width', `${width}px`)
        img.style.setProperty('height', `${height}px`)
        img.style.setProperty('max-width', 'unset')
      }
    })

    const fallbackImages = Array.from(
      document.querySelectorAll('img[data-omnivore-original-src]')
    )

    fallbackImages.forEach((element) => {
      const img = element as HTMLImageElement
      const fallbackSrc = img.getAttribute('data-omnivore-original-src')
      if (fallbackSrc) {
        img.onerror = () => {
          console.log('image falling back to original: ', fallbackSrc)
          // If the image fails to load fallback to the original
          img.onerror = null
          img.src = fallbackSrc
        }
      }
    })

    const allImages = Array.from(
      document.querySelectorAll('img[data-omnivore-anchor-idx]')
    )

    const srcs = allImages.map((img) => {
      return {
        src: img.getAttribute('src') || '',
      }
    })
    setImageSrcs(srcs)

    allImages.forEach((element, idx) => {
      const img = element as HTMLImageElement
      img.style.cursor = 'zoom-in'
      img.onclick = (event) => {
        setlightBoxIndex(idx)
        setLightboxOpen(true)
        event.preventDefault()
        event.stopPropagation()
      }
    })
  }, [props.content])

  useEffect(() => {
    if (lightboxOpen) {
      window?.webkit?.messageHandlers.highlightAction?.postMessage({
        actionID: 'dismissNavBars',
      })
    }
  }, [lightboxOpen])

  const lightboxPlugins = useMemo(() => {
    if (props.isAppleAppEmbed) {
      return [Fullscreen, Counter, Zoom]
    } else {
      return [Fullscreen, Download, Counter, Zoom]
    }
  }, [props])

  return (
    <>
      <link
        rel="stylesheet"
        href={`/static/highlightjs/${highlightTheme}.min.css`}
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
      <SpanBox
        onClick={(event) => {
          event.stopPropagation()
        }}
      >
        <Lightbox
          open={lightboxOpen}
          index={lightboxIndex}
          close={() => setLightboxOpen(false)}
          slides={imageSrcs}
          plugins={lightboxPlugins}
          controller={{ closeOnPullDown: true, closeOnBackdropClick: true }}
          zoom={{
            maxZoomPixelRatio: 3,
          }}
          render={{
            buttonZoom: () => undefined,
          }}
        />
      </SpanBox>
    </>
  )
}
