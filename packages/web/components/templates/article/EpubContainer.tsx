import { ArticleAttributes } from '../../../lib/networking/library_items/useLibraryItems'
import { Box, VStack } from '../../elements/LayoutPrimitives'
import { v4 as uuidv4 } from 'uuid'
import { nanoid } from 'nanoid'
import { useState, useEffect, useRef, useMemo } from 'react'
import {
  getCurrentLocalTheme,
  getTheme,
  isDarkTheme,
} from '../../../lib/themeUpdater'
import PSPDFKit from 'pspdfkit'
import { Instance, HighlightAnnotation, List, Annotation, Rect } from 'pspdfkit'
import type { Highlight } from '../../../lib/networking/fragments/highlightFragment'
import { useCanShareNative } from '../../../lib/hooks/useCanShareNative'
import { pspdfKitKey } from '../../../lib/appConfig'
import { NotebookModal } from './NotebookModal'
import { HighlightNoteModal } from './HighlightNoteModal'
import { showErrorToast } from '../../../lib/toastHelpers'
import { DEFAULT_HEADER_HEIGHT } from '../homeFeed/HeaderSpacer'
import { UserBasicData } from '../../../lib/networking/queries/useGetViewerQuery'
import Epub, { EpubCFI } from 'epubjs'
import { Rendition, Contents } from 'epubjs/types'
import { useKeyboardShortcuts } from '../../../lib/keyboardShortcuts/useKeyboardShortcuts'
import { theme } from '../../tokens/stitches.config'

export type EpubContainerProps = {
  viewer: UserBasicData
  article: ArticleAttributes
  showHighlightsModal: boolean
  setShowHighlightsModal: React.Dispatch<React.SetStateAction<boolean>>
}

type EpubPatch = {
  cfi: string
  base: string
}

export default function EpubContainer(props: EpubContainerProps): JSX.Element {
  const epubRef = useRef<HTMLDivElement | null>(null)
  const renditionRef = useRef<Rendition | undefined>(undefined)
  const [shareTarget, setShareTarget] = useState<Highlight | undefined>(
    undefined
  )
  const [touchStart, setTouchStart] = useState(0)
  const [notebookKey, setNotebookKey] = useState<string>(uuidv4())
  const [noteTarget, setNoteTarget] = useState<Highlight | undefined>(undefined)
  const [noteTargetPageIndex, setNoteTargetPageIndex] = useState<
    number | undefined
  >(undefined)
  const highlightsRef = useRef<Highlight[]>([])

  const book = useMemo(() => {
    console.log('loading book: ', props.article.url)
    const book = Epub(props.article.url, {
      openAs: 'epub',
    })
    book.loaded.navigation.then((nav) => {
      console.log('navigated to: ', nav)
    })
    console.log('loaded book: ', book)
    return book
  }, [props.article])

  useEffect(() => {
    if (!epubRef.current || !book || !book.loaded) {
      return
    }

    if (renditionRef.current) {
      console.log('book already rendered')
      return
    }

    const epubOptions = {}
    const node = epubRef.current
    renditionRef.current = book.renderTo(node, {
      width: '100%',
      height: '100%',
    })

    renditionRef.current?.on('touchstart', (event: TouchEvent) => {
      setTouchStart(event.changedTouches[0].screenX)
    })

    renditionRef.current?.on('touchend', (event: TouchEvent) => {
      console.log('touchend: ', event)

      const _touchEnd = event.changedTouches[0].screenX
      if (touchStart < _touchEnd) {
        renditionRef.current?.next()
      }
      if (touchStart > _touchEnd) {
        renditionRef.current?.prev()
      }
    })

    renditionRef.current?.on('keydown', (ev: KeyboardEvent) => {
      if (ev.key == 'ArrowRight') {
        renditionRef.current?.next()
      } else if (ev.key == 'ArrowLeft') {
        renditionRef.current?.prev()
      }
    })

    const themeId = getCurrentLocalTheme()
    if (themeId) {
      const readerTheme = getTheme(themeId)
      renditionRef.current.themes.override(
        'color',
        readerTheme.colors.readerFont.value,
        true
      )
      renditionRef.current.themes.override(
        'background',
        readerTheme.colors.readerBg.value,
        true
      )
      renditionRef.current.themes.override(
        'backgroundColor',
        readerTheme.colors.readerBg.value,
        true
      )
      renditionRef.current.themes.default({
        'a:hover': {
          color: 'unset !important',
        },
      })
    }
    renditionRef.current.display()

    // }
  }, [book, epubRef, renditionRef])

  /*
  useEffect(() => {
    async function setRenderSelection(cfirange: string, contents: Contents) {
      if (!renditionRef.current) {
        return
      }

      console.log('contents of path: ', contents.content.innerHTML)

      const ranges = await Promise.all(
        highlightsRef.current
          .map((highlight) => highlight.patch)
          .map((patch) => JSON.parse(patch) as EpubPatch)
          .map((patch) => book.getRange(patch.cfi))
      )

      // console.log('cfis: ', cfis)

      // const ranges = cfis.map((cfi) => cfi.toRange(document))
      console.log(
        'ranges: ',
        ranges,
        ranges.map((range) => range.getBoundingClientRect())
      )
      // setSelections(
      //   selections.concat({
      //     text: renditionRef.current.getRange(cfiRange).toString(),
      //     cfiRange,
      //   })
      // )

      function rectsOverlap(l1: DOMRect, l2: DOMRect): boolean {
        console.log('checking overlap: ', l1, l2)
        return (
          l1.left < l2.right &&
          l1.right > l2.left &&
          l1.top > l2.bottom &&
          l1.bottom < l2.top
        )
      }

      const highlightCfi = await book.getRange(cfirange)
      console.log(
        'highlightCfi',
        highlightCfi,
        highlightCfi.getBoundingClientRect()
      )
      const selectionRange = contents.window.getSelection()?.getRangeAt(0)

      console.log('selectionRange: ', selectionRange)

      let overlap = false
      if (selectionRange) {
        const highlightRect = selectionRange.getClientRects()

        ranges.forEach((range) => {
          const rects = range.getClientRects()
          console.log(' existing rects: ', rects)
          console.log(' highlightRects: ', highlightRect)

          for (let ei = 0; ei < rects.length; ei++) {
            const check = rects.item(ei)
            if (!check) {
              continue
            }
            for (let ni = 0; ni < rects.length; ni++) {
              const newRect = highlightRect.item(ni)
              if (!newRect) {
                continue
              }
              if (rectsOverlap(newRect, check)) {
                overlap = true
              }
            }
          }
        })
      }

      console.log('found an overlap: ', overlap)

      const highlightId = uuidv4()

      const highlight = await createHighlightMutation({
        id: highlightId,
        shortId: nanoid(8),
        type: 'HIGHLIGHT',
        patch: JSON.stringify({
          base: renditionRef.current.epubcfi,
          cfi: cfirange,
        }),
        articleId: props.article.id,
      })

      if (!highlight) {
        showErrorToast('Unable to create highlight')
        return
      }

      highlightsRef.current.push(highlight)

      renditionRef.current.annotations.highlight(
        cfirange,
        {
          omnivoreHighlight: highlight,
        },
        undefined,
        'hl',
        {
          fill: theme.colors.highlightBackground.toString(),
          'fill-opacity': '0.3',
          'mix-blend-mode': 'multiply',
        }
      )
      contents.window.getSelection()?.removeAllRanges()
    }

    renditionRef.current?.on('selected', setRenderSelection)
    return () => {
      renditionRef.current?.off('selected', setRenderSelection)
    }
  }, [renditionRef])
  */

  useEffect(() => {
    const keyDown = (ev: KeyboardEvent) => {
      console.log('keydown: ', ev.key)
      if (ev.key == 'ArrowRight') {
        renditionRef.current?.next()
      } else if (ev.key == 'ArrowLeft') {
        renditionRef.current?.prev()
      }
    }

    document.addEventListener('keydown', keyDown)
    return () => {
      document.removeEventListener('keydown', keyDown)
    }
  })

  return (
    <Box
      css={{
        padding: '120px',
        paddingTop: '10px',
        paddingBottom: '0px',
        // minHeight: '100vh',
        '@sm': {
          '--blockquote-padding': '1em 2em',
          '--blockquote-icon-font-size': '1.7rem',
          '--figure-margin': '2.6875rem auto',
          '--hr-margin': '2em',
          margin: `0px 0px`,
        },
        // '@md': {
        //   maxWidth: styles.maxWidthPercentage
        //     ? `${styles.maxWidthPercentage}%`
        //     : 1024 - styles.margin,
        // },
        '@mdDown': {
          padding: '0px',
          paddingBottom: '0px',
        },
        width: '100%',
        height: `calc(100vh - ${DEFAULT_HEADER_HEIGHT})`,
      }}
    >
      <Box
        ref={epubRef}
        css={{
          width: '100%',
          height: '100%',
        }}
      >
        {/* EPUB CONTAINER
        <div ></div> */}
      </Box>
    </Box>
  )
}
