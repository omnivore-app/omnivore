import { Box, SpanBox } from '../../elements/LayoutPrimitives'
import {
  getTopOmnivoreAnchorElement,
  parseDomTree,
} from '../../../lib/anchorElements'
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
import { isDarkTheme } from '../../../lib/themeUpdater'
import { ArticleMutations } from '../../../lib/articleActions'
import { Lightbox, SlideImage } from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import Download from 'yet-another-react-lightbox/plugins/download'
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import Counter from 'yet-another-react-lightbox/plugins/counter'

import loadjs from 'loadjs'
import { LinkHoverBar } from '../../patterns/LinkHoverBar'

export type ArticleProps = {
  articleId: string
  content: string
  initialAnchorIndex: number
  initialReadingProgress?: number
  initialReadingProgressTop?: number
  highlightHref: MutableRefObject<string | null>
  articleMutations: ArticleMutations
  isAppleAppEmbed: boolean
}

type PageCoordinates = {
  pageX: number
  pageY: number
}

type LinkHoverData = {
  href: string
  pageCoordinate: PageCoordinates
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
  const [linkHoverData, setlinkHoverData] = useState<
    LinkHoverData | undefined
  >()

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
    if (
      typeof window?.webkit != 'undefined' &&
      'messageHandlers' in window.webkit
    ) {
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

  useEffect(() => {
    const youtubePlayer = document.getElementById('_omnivore_youtube_video')

    const updateScroll = () => {
      const YOUTUBE_PLACEHOLDER_ID = 'omnivore-youtube-placeholder'
      const youtubePlaceholder = document.getElementById(YOUTUBE_PLACEHOLDER_ID)

      if (youtubePlayer) {
        if (window.scrollY > 400) {
          if (!youtubePlaceholder) {
            const rect = youtubePlayer.getBoundingClientRect()
            const placeholder = document.createElement('div')
            placeholder.setAttribute('id', YOUTUBE_PLACEHOLDER_ID)
            placeholder.style.width = rect.width + 'px'
            placeholder.style.height = rect.height + 'px'
            youtubePlayer.parentNode?.insertBefore(placeholder, youtubePlayer)
          }
          youtubePlayer.classList.add('is-sticky')
        } else {
          if (youtubePlaceholder) {
            youtubePlayer.parentNode?.removeChild(youtubePlaceholder)
          }
          youtubePlayer.classList.remove('is-sticky')
        }
      }
    }
    if (youtubePlayer) {
      window.addEventListener('scroll', updateScroll)
    }
    return () => {
      window.removeEventListener('scroll', updateScroll) // clean up
    }
  }, [props])

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
    const tikTokPlaceholders = Array.from(
      document.getElementsByClassName('tiktok-embed')
    )

    if (tikTokPlaceholders.length > 0) {
      ;(async () => {
        const tkScriptUrl = 'https://www.tiktok.com/embed.js'
        const tkScriptWindowFieldName = 'tiktok'
        const tkScriptName = tkScriptWindowFieldName

        await new Promise((resolve, reject) => {
          if (!loadjs.isDefined(tkScriptName)) {
            loadjs(tkScriptUrl, tkScriptName)
          }
          loadjs.ready(tkScriptName, {
            success: () => {
              if (window.tiktokEmbed) {
                window.tiktokEmbed.lib.render(tikTokPlaceholders)
              }
              resolve(true)
            },
            error: () => reject(new Error('Could not load TikTok handler')),
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

  // const linkMouseOver = useCallback(
  //   (event: Event) => {
  //     const element = event.target as HTMLLinkElement

  //     setlinkHoverData({
  //       href: element.href,
  //       pageCoordinate: {
  //         pageX: element.offsetLeft,
  //         pageY: element.offsetTop - 45,
  //       },
  //     })
  //   },
  //   [props]
  // )

  // const linkMouseOut = useCallback(
  //   (event: Event) => {
  //     console.log('mouse out link', event.target)
  //     setlinkHoverData(undefined)
  //   },
  //   [props]
  // )

  useEffect(() => {
    const embeddedLinks = Array.from(
      document.querySelectorAll('a[data-omnivore-anchor-idx]')
    )

    embeddedLinks.forEach((link: Element) => {
      link.setAttribute('target', '_blank')
      // link.addEventListener('mouseover', linkMouseOver)
      // link.addEventListener('mouseout', linkMouseOut)
    })
  }, [props.content])

  return (
    <>
      {!props.isAppleAppEmbed && (
        <link
          rel="stylesheet"
          href={`/static/highlightjs/${highlightTheme}.min.css`}
        />
      )}
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
      {linkHoverData && (
        <>
          <LinkHoverBar
            anchorCoordinates={linkHoverData.pageCoordinate}
            handleButtonClick={() => {
              console.log('saved link hover: ', linkHoverData)
            }}
          />
        </>
      )}
    </>
  )
}
