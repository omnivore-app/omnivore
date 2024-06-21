import { ArticleAttributes } from '../../../lib/networking/queries/useGetArticleQuery'
import { Box } from '../../elements/LayoutPrimitives'
import { v4 as uuidv4 } from 'uuid'
import { nanoid } from 'nanoid'
import { useState, useEffect, useRef } from 'react'
import { isDarkTheme } from '../../../lib/themeUpdater'
import PSPDFKit from 'pspdfkit'
import { Instance, HighlightAnnotation, List, Annotation, Rect } from 'pspdfkit'
import type { Highlight } from '../../../lib/networking/fragments/highlightFragment'
import { createHighlightMutation } from '../../../lib/networking/mutations/createHighlightMutation'
import { deleteHighlightMutation } from '../../../lib/networking/mutations/deleteHighlightMutation'
import { articleReadingProgressMutation } from '../../../lib/networking/mutations/articleReadingProgressMutation'
import { mergeHighlightMutation } from '../../../lib/networking/mutations/mergeHighlightMutation'
import { pspdfKitKey } from '../../../lib/appConfig'
import { HighlightNoteModal } from './HighlightNoteModal'
import { showErrorToast } from '../../../lib/toastHelpers'
import { DEFAULT_HEADER_HEIGHT } from '../homeFeed/HeaderSpacer'
import { UserBasicData } from '../../../lib/networking/queries/useGetViewerQuery'
import 'react-sliding-pane/dist/react-sliding-pane.css'
import { NotebookContent } from './Notebook'
import { NotebookHeader } from './NotebookHeader'
import useWindowDimensions from '../../../lib/hooks/useGetWindowDimensions'
import { ResizableSidebar } from './ResizableSidebar'

export type PdfArticleContainerProps = {
  viewer: UserBasicData
  article: ArticleAttributes
  showHighlightsModal: boolean
  setShowHighlightsModal: React.Dispatch<React.SetStateAction<boolean>>
}

export default function PdfArticleContainer(
  props: PdfArticleContainerProps
): JSX.Element {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [notebookKey, setNotebookKey] = useState<string>(uuidv4())
  const [noteTarget, setNoteTarget] = useState<Highlight | undefined>(undefined)
  const [noteTargetPageIndex, setNoteTargetPageIndex] =
    useState<number | undefined>(undefined)
  const highlightsRef = useRef<Highlight[]>([])

  const annotationOmnivoreId = (annotation: Annotation): string | undefined => {
    if (
      annotation &&
      annotation.customData &&
      annotation.customData.omnivoreHighlight &&
      (annotation.customData.omnivoreHighlight as Highlight).id
    ) {
      return (annotation.customData.omnivoreHighlight as Highlight).id
    }
    return undefined
  }

  useEffect(() => {
    let instance: Instance
    const container = containerRef.current
    ;(async function () {
      const ALLOWED_TOOLBAR_ITEM_TYPES = [
        'pager',
        'zoom-out',
        'zoom-in',
        'zoom-mode',
        'spacer',
        'search',
        'export-pdf',
        'sidebar-bookmarks',
        'sidebar-thumbnails',
        'sidebar-document-outline',
      ]

      console.log('PSPDFKit.defaultToolbarItems', PSPDFKit.defaultToolbarItems)
      const toolbarItems = PSPDFKit.defaultToolbarItems.filter(
        (i) => ALLOWED_TOOLBAR_ITEM_TYPES.indexOf(i.type) !== -1
      )

      const positionPercentForAnnotation = (annotation: Annotation) => {
        let totalSize = 0
        let sizeBefore = 0
        for (let idx = 0; idx < annotation.pageIndex; idx++) {
          sizeBefore += instance.pageInfoForIndex(idx)?.height ?? 0
        }
        for (let idx = 0; idx < instance.totalPageCount; idx++) {
          totalSize += instance.pageInfoForIndex(idx)?.height ?? 0
        }
        return (sizeBefore + annotation.boundingBox.top) / totalSize
      }

      const annotationTooltipCallback = (annotation: Annotation) => {
        const highlightAnnotation = annotation as HighlightAnnotation
        const copy = {
          type: 'custom' as const,
          title: 'Copy',
          id: 'tooltip-copy-annotation',
          className: 'TooltipItem-Copy',
          onPress: async () => {
            const highlightText = await instance.getMarkupAnnotationText(
              highlightAnnotation
            )
            navigator.clipboard.writeText(highlightText)
            instance.setSelectedAnnotation(null)
          },
        }
        const remove = {
          type: 'custom' as const,
          title: 'Remove',
          id: 'tooltip-remove-annotation',
          className: 'TooltipItem-Remove',
          onPress: () => {
            const annotationId = annotationOmnivoreId(annotation)

            instance
              .delete(annotation)
              .then(() => {
                if (annotationId) {
                  return deleteHighlightMutation(props.article.id, annotationId)
                }
              })
              .then(() => {
                const highlightIdx = highlightsRef.current.findIndex(
                  (value) => {
                    return value.id == annotationId
                  }
                )
                if (highlightIdx > -1) {
                  highlightsRef.current.splice(highlightIdx, 1)
                }
              })
              .catch((err) => {
                showErrorToast('Error deleting highlight: ' + err)
              })
          },
        }
        const note = {
          type: 'custom' as const,
          title: 'Note',
          id: 'tooltip-note-annotation',
          className: 'TooltipItem-Note',
          onPress: async () => {
            if (
              annotation.customData &&
              annotation.customData.omnivoreHighlight &&
              (annotation.customData.omnivoreHighlight as Highlight).shortId
            ) {
              const data = annotation.customData.omnivoreHighlight as Highlight
              const savedHighlight = highlightsRef.current.find(
                (other: Highlight) => {
                  return other.id === data.id
                }
              )
              data.annotation = savedHighlight?.annotation ?? data.annotation
              setNoteTargetPageIndex(annotation.pageIndex)
              setNoteTarget(data)
            }
            instance.setSelectedAnnotation(null)
          },
        }
        // const share = {
        //   type: 'custom' as const,
        //   title: 'Share',
        //   id: 'tooltip-share-annotation',
        //   className: 'TooltipItem-Share',
        //   onPress: () => {
        //     if (
        //       annotation.customData &&
        //       annotation.customData.omnivoreHighlight &&
        //       (annotation.customData.omnivoreHighlight as Highlight).shortId
        //     ) {
        //       const data = annotation.customData.omnivoreHighlight as Highlight
        //       handleOpenShare(data)
        //     }
        //     instance.setSelectedAnnotation(null)
        //   },
        // }
        return [copy, note, remove]
      }

      const annotationPresets = PSPDFKit.defaultAnnotationPresets
      annotationPresets.highlight = {
        opacity: 0.45,
        color: new PSPDFKit.Color({ r: 255, g: 210, b: 52 }),
        blendMode: PSPDFKit.BlendMode.multiply,
      }

      const initialPage = () => {
        const highlightHref = window.location.hash
          ? window.location.hash.split('#')[1]
          : null
        if (highlightHref) {
          // find the page index if possible
          const highlight = props.article.highlights.find(
            (h) => h.id === highlightHref
          )
          if (highlight) {
            return highlight.highlightPositionAnchorIndex
          }
        }
        return props.article.readingProgressAnchorIndex
      }

      const config = {
        container: container || '.pdf-container',
        toolbarItems,
        annotationPresets,
        document: props.article.url,
        theme: isDarkTheme() ? PSPDFKit.Theme.DARK : PSPDFKit.Theme.LIGHT,
        baseUrl: `${window.location.protocol}//${window.location.host}/`,
        licenseKey: pspdfKitKey,
        styleSheets: ['/static/pspdfkit-lib.css'],
        annotationTooltipCallback: annotationTooltipCallback,
        initialViewState: new PSPDFKit.ViewState({
          zoom: PSPDFKit.ZoomMode.FIT_TO_WIDTH,
          currentPageIndex: initialPage() || 0,
        }),
      }

      console.log('instnace config: ', config)

      instance = await PSPDFKit.load(config)
      console.log('created PDF instance', instance)

      instance.addEventListener('annotations.willChange', async (event) => {
        const annotation = event.annotations.get(0)
        if (
          !annotation ||
          event.reason !== PSPDFKit.AnnotationsWillChangeReason.DELETE_END
        ) {
          return
        }
        const annotationId = annotationOmnivoreId(annotation)
        if (annotationId) {
          await deleteHighlightMutation(props.article.id, annotationId)
        }
      })

      // Store the highlights in the highlightsRef and apply them to the PDF
      highlightsRef.current = props.article.highlights
      for (const highlight of props.article.highlights.filter(
        (h) => h.type == 'HIGHLIGHT'
      )) {
        const patch = JSON.parse(highlight.patch)
        if (highlight.annotation && patch.customData.omnivoreHighight) {
          patch.customData.omnivoreHighight.annotation = highlight.annotation
        }

        const annotation = PSPDFKit.Annotations.fromSerializableObject(
          patch
        ) as Annotation

        try {
          await instance.create(annotation)
        } catch (e) {
          console.log('error adding highlight')
          console.log(e)
        }
      }

      const findOverlappingHighlights = async (
        instance: Instance,
        highlightAnnotation: HighlightAnnotation
      ): Promise<List<Annotation>> => {
        const existing = await instance.getAnnotations(
          highlightAnnotation.pageIndex
        )

        const highlights = existing.filter((annotation) => {
          return (
            annotation instanceof PSPDFKit.Annotations.HighlightAnnotation &&
            annotation.customData &&
            annotation.customData.omnivoreHighlight
          )
        })

        const overlapping = highlights.filter((annotation) => {
          const isRes = annotation.rects.some((rect: Rect) => {
            return highlightAnnotation.rects.some((highlightRect) => {
              return rect.isRectOverlapping(highlightRect)
            })
          })
          return isRes
        })

        return overlapping
      }

      instance.addEventListener(
        'annotations.create',
        async (createdAnnotations) => {
          const highlightAnnotation = createdAnnotations.get(0)

          if (
            !(
              highlightAnnotation instanceof
              PSPDFKit.Annotations.HighlightAnnotation
            )
          ) {
            return
          }

          // If the annotation already has the omnivore highlight
          // custom data its already been created, so we can
          // ignore this event.
          if (
            highlightAnnotation.customData &&
            highlightAnnotation.customData.omnivoreHighlight
          ) {
            // This highlight has already been created, so we skip adding it
            return
          }

          const overlapping = await findOverlappingHighlights(
            instance,
            highlightAnnotation
          )

          const id = uuidv4()
          const shortId = nanoid(8)
          const quote = (
            await instance.getMarkupAnnotationText(highlightAnnotation)
          )
            .replace(/(\r\n|\n|\r)/gm, ' ')
            .trim()

          const surroundingText = { prefix: '', suffix: '' }
          const annotation = highlightAnnotation.set('customData', {
            omnivoreHighlight: {
              id,
              quote,
              shortId,
              prefix: surroundingText.prefix,
              suffix: surroundingText.suffix,
              articleId: props.article.id,
            },
          })

          await instance.update(annotation)
          const serialized =
            PSPDFKit.Annotations.toSerializableObject(annotation)

          if (overlapping.size === 0) {
            const positionPercent = positionPercentForAnnotation(annotation)
            const result = await createHighlightMutation({
              id: id,
              shortId: shortId,
              quote: quote,
              articleId: props.article.id,
              prefix: surroundingText.prefix,
              suffix: surroundingText.suffix,
              patch: JSON.stringify(serialized),
              highlightPositionPercent: positionPercent * 100,
              highlightPositionAnchorIndex: annotation.pageIndex,
            })
            if (result) {
              highlightsRef.current.push(result)
            }
          } else {
            // Create a new single highlight in the PDF
            const rects = highlightAnnotation.rects.concat(
              overlapping.flatMap((ha) => ha.rects as List<Rect>)
            )
            const annotation = new PSPDFKit.Annotations.HighlightAnnotation({
              pageIndex: highlightAnnotation.pageIndex,
              rects: rects,
              opacity: 0.45,
              color: new PSPDFKit.Color({ r: 255, g: 210, b: 52 }),
              boundingBox: PSPDFKit.Geometry.Rect.union(rects),
              customData: {
                omnivoreHighlight: {
                  id,
                  quote,
                  shortId,
                  prefix: surroundingText.prefix,
                  suffix: surroundingText.suffix,
                  articleId: props.article.id,
                },
              },
            })

            await instance.create(annotation)
            await instance.delete(overlapping)
            await instance.delete(highlightAnnotation)

            const mergedIds = overlapping.map(
              (ha) => (ha.customData?.omnivoreHighlight as Highlight).id
            )
            const positionPercent = positionPercentForAnnotation(annotation)
            const result = await mergeHighlightMutation({
              quote,
              id,
              shortId,
              patch: JSON.stringify(serialized),
              prefix: surroundingText.prefix,
              suffix: surroundingText.suffix,
              articleId: props.article.id,
              overlapHighlightIdList: mergedIds.toArray(),
              highlightPositionPercent: positionPercent * 100,
              highlightPositionAnchorIndex: annotation.pageIndex,
            })
            if (result) {
              highlightsRef.current.push(result)
            }
          }
        }
      )

      instance.addEventListener(
        'viewState.currentPageIndex.change',
        async (pageIndex) => {
          const percent = Math.min(
            100,
            Math.max(0, ((pageIndex + 1) / instance.totalPageCount) * 100)
          )
          await articleReadingProgressMutation({
            id: props.article.id,
            force: true,
            readingProgressPercent: percent,
            readingProgressAnchorIndex: pageIndex,
          })
        }
      )

      type PossibleInputEventTarget = KeyboardEvent & {
        nodeName: string
      }

      function isPossibleInputEventTarget(
        target: any
      ): target is PossibleInputEventTarget {
        return (
          'nodeName' in target &&
          typeof target.nodeName == 'string' &&
          target.nodeName
        )
      }

      function keyDownHandler(event: KeyboardEvent) {
        const inputs = ['input', 'select', 'button', 'textarea']

        if (event.target && isPossibleInputEventTarget(event.target)) {
          const nodeName = event.target.nodeName.toLowerCase()
          if (inputs.indexOf(nodeName) != -1) {
            return
          }
        }

        const key = event.key.toLowerCase()
        switch (key) {
          case 'o':
            document.dispatchEvent(new Event('openOriginalArticle'))
            break
          case 'u':
            const navReturn = window.localStorage.getItem('nav-return')
            if (navReturn) {
              window.location.assign(navReturn)
              return
            }
            const query = window.sessionStorage.getItem('q')
            if (query) {
              window.location.assign(`/l/home?${query}`)
            } else {
              window.location.replace(`/l/home`)
            }
            break
          case 'e':
            document.dispatchEvent(new Event('archive'))
            break
          case '#':
            document.dispatchEvent(new Event('delete'))
            break
          case 'h':
            const root = (event.target as HTMLElement).querySelector(
              '.PSPDFKit-Root'
            )
            const highlight = root?.querySelector(
              '.PSPDFKit-Text-Markup-Inline-Toolbar-Highlight'
            )
            if (highlight && highlight?.nodeName == 'BUTTON') {
              const button = highlight as HTMLButtonElement
              button.click()
            }
            break
          // case 'n':
          // TODO: need to set a post creation event here, then
          // go through the regular highlight creation
          //   document.dispatchEvent(new Event('annotate'))
          //   break
          case 't':
            props.setShowHighlightsModal(true)
            break
          case 'i':
            document.dispatchEvent(new Event('showEditModal'))
            break
        }
      }

      const isIE11 = navigator.userAgent.indexOf('Trident/') > -1
      instance.contentDocument.addEventListener(
        'keydown',
        keyDownHandler,
        isIE11
          ? {
              capture: true,
            }
          : true
      )
    })()

    document.addEventListener('deleteHighlightbyId', async (event) => {
      const annotationId = (event as CustomEvent).detail as string
      for (let pageIdx = 0; pageIdx < instance.totalPageCount; pageIdx++) {
        const annotations = await instance.getAnnotations(pageIdx)
        for (let annIdx = 0; annIdx < annotations.size; annIdx++) {
          const annotation = annotations.get(annIdx)
          if (!annotation) {
            continue
          }
          const storedId = annotationOmnivoreId(annotation)
          if (storedId == annotationId) {
            await instance.delete(annotation)
            await deleteHighlightMutation(props.article.id, annotationId)

            const highlightIdx = highlightsRef.current.findIndex((value) => {
              return value.id == annotationId
            })
            if (highlightIdx > -1) {
              highlightsRef.current.splice(highlightIdx, 1)
            }
            // This is needed to force the notebook to reload the highlights
            setNotebookKey(uuidv4())
          }
        }
      }
    })

    document.addEventListener('scrollToHighlightId', async (event) => {
      const annotationId = (event as CustomEvent).detail as string
      for (let pageIdx = 0; pageIdx < instance.totalPageCount; pageIdx++) {
        const annotations = await instance.getAnnotations(pageIdx)
        for (let annIdx = 0; annIdx < annotations.size; annIdx++) {
          const annotation = annotations.get(annIdx)
          if (!annotation) {
            continue
          }
          const storedId = annotationOmnivoreId(annotation)
          if (storedId == annotationId) {
            instance.jumpToRect(pageIdx, annotation.boundingBox)
          }
        }
      }
    })

    document.addEventListener('pdfReaderUpdateSettings', () => {
      const show = localStorage.getItem('reader-show-pdf-tool-bar')
      const showToolbarbar = show ? JSON.parse(show) == true : false

      instance.setViewState((viewState) =>
        viewState.set('showToolbar', showToolbarbar)
      )
    })

    return () => {
      PSPDFKit && container && PSPDFKit.unload(container)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  // We are intentially not setting exhaustive deps here, we only want to reload
  // the PSPDFKit instance if the theme, article URL, or page URL changes. Everything else
  // should be handled by the PSPDFKit instance callbacks.

  const windowDimensions = useWindowDimensions()

  return (
    <Box
      id="article-wrapper"
      css={{
        width: '100%',
        height: `calc(100vh - ${DEFAULT_HEADER_HEIGHT})`,
      }}
    >
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      {noteTarget && (
        <HighlightNoteModal
          highlight={noteTarget}
          libraryItemId={props.article.id}
          author={props.article.author ?? ''}
          title={props.article.title}
          onUpdate={(highlight: Highlight) => {
            const savedHighlight = highlightsRef.current.find(
              (other: Highlight) => {
                return other.id == highlight.id
              }
            )

            if (savedHighlight) {
              savedHighlight.annotation = highlight.annotation
            }
          }}
          onOpenChange={() => {
            setNoteTarget(undefined)
          }}
        />
      )}
      <ResizableSidebar
        isShow={props.showHighlightsModal}
        onClose={() => {
          props.setShowHighlightsModal(false)
        }}
      >
        <NotebookHeader
          viewer={props.viewer}
          item={props.article}
          setShowNotebook={props.setShowHighlightsModal}
        />
        <NotebookContent
          viewer={props.viewer}
          item={props.article}
          viewInReader={(highlightId) => {
            const event = new CustomEvent('scrollToHighlightId', {
              detail: highlightId,
            })
            document.dispatchEvent(event)
          }}
        />
      </ResizableSidebar>
    </Box>
  )
}
