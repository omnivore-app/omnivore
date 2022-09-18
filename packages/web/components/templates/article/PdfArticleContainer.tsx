import { ArticleAttributes } from '../../../lib/networking/queries/useGetArticleQuery'
import { Box } from '../../elements/LayoutPrimitives'
import { v4 as uuidv4 } from 'uuid'
import { nanoid } from 'nanoid'
import { useState, useEffect, useCallback, useRef } from 'react'
import { isDarkTheme } from '../../../lib/themeUpdater'
import PSPDFKit from 'pspdfkit'
import { Instance, HighlightAnnotation, List, Annotation, Rect } from 'pspdfkit'
import type { Highlight } from '../../../lib/networking/fragments/highlightFragment'
import { createHighlightMutation } from '../../../lib/networking/mutations/createHighlightMutation'
import { deleteHighlightMutation } from '../../../lib/networking/mutations/deleteHighlightMutation'
import { articleReadingProgressMutation } from '../../../lib/networking/mutations/articleReadingProgressMutation'
import { mergeHighlightMutation } from '../../../lib/networking/mutations/mergeHighlightMutation'
import { ShareHighlightModal } from './ShareHighlightModal'
import { useCanShareNative } from '../../../lib/hooks/useCanShareNative'
import { webBaseURL } from '../../../lib/appConfig'
import { pspdfKitKey } from '../../../lib/appConfig'
import { HighlightsModal } from './HighlightsModal'

export type PdfArticleContainerProps = {
  viewerUsername: string
  article: ArticleAttributes
  showHighlightsModal: boolean
  setShowHighlightsModal: React.Dispatch<React.SetStateAction<boolean>>
}

export default function PdfArticleContainer(
  props: PdfArticleContainerProps
): JSX.Element {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [shareTarget, setShareTarget] = useState<Highlight | undefined>(
    undefined
  )
  const canShareNative = useCanShareNative()

  const getHighlightURL = useCallback(
    (highlightID: string): string =>
      `${webBaseURL}/${props.viewerUsername}/${props.article.slug}/highlights/${highlightID}`,
    [props.article.slug, props.viewerUsername]
  )

  const nativeShare = useCallback(
    async (highlightID: string, title: string) => {
      await navigator?.share({
        title: title,
        url: getHighlightURL(highlightID),
      })
    },
    [getHighlightURL]
  )

  const handleOpenShare = useCallback(
    (highlight: Highlight) => {
      if (canShareNative) {
        nativeShare(highlight.shortId, props.article.title)
      } else {
        setShareTarget(highlight)
      }
    },
    [nativeShare, canShareNative, props.article.title]
  )

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
      ]
      const toolbarItems = PSPDFKit.defaultToolbarItems.filter(
        (i) => ALLOWED_TOOLBAR_ITEM_TYPES.indexOf(i.type) !== -1
      )

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
            instance.delete(annotation).then(() => {
              if (
                annotation.customData &&
                annotation.customData.omnivoreHighlight &&
                (annotation.customData.omnivoreHighlight as Highlight).id
              ) {
                const data = annotation.customData
                  .omnivoreHighlight as Highlight
                deleteHighlightMutation(data.id)
              }
            })
          },
        }
        const share = {
          type: 'custom' as const,
          title: 'Share',
          id: 'tooltip-share-annotation',
          className: 'TooltipItem-Share',
          onPress: () => {
            if (
              annotation.customData &&
              annotation.customData.omnivoreHighlight &&
              (annotation.customData.omnivoreHighlight as Highlight).shortId
            ) {
              const data = annotation.customData.omnivoreHighlight as Highlight
              handleOpenShare(data)
            }
            instance.setSelectedAnnotation(null)
          },
        }
        return [copy, remove]
      }

      const annotationPresets = PSPDFKit.defaultAnnotationPresets;
      annotationPresets.highlight = {
        opacity: 0.45,
        color: new PSPDFKit.Color({ r: 255, g: 210, b: 52 }),
        blendMode: PSPDFKit.BlendMode.multiply,
      };

      instance = await PSPDFKit.load({
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
          currentPageIndex: props.article.readingProgressAnchorIndex || 0,
        }),
      })

      instance.addEventListener('annotations.willChange', (event) => {
        const annotation = event.annotations.get(0)
        if (event.reason !== PSPDFKit.AnnotationsWillChangeReason.DELETE_END) {
          return
        }
        if (
          annotation &&
          annotation.customData &&
          annotation.customData.omnivoreHighlight &&
          (annotation.customData.omnivoreHighlight as Highlight).id
        ) {
          const data = annotation.customData.omnivoreHighlight as Highlight
          deleteHighlightMutation(data.id)
        }
      })

      // Apply highlights to the PDF
      for (const highlight of props.article.highlights) {
        const patch = JSON.parse(highlight.patch)
        const annotation = PSPDFKit.Annotations.fromSerializableObject(patch)

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
            await createHighlightMutation({
              id: id,
              shortId: shortId,
              quote: quote,
              articleId: props.article.id,
              prefix: surroundingText.prefix,
              suffix: surroundingText.suffix,
              patch: JSON.stringify(serialized),
            })
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
            await mergeHighlightMutation({
              quote,
              id,
              shortId,
              patch: JSON.stringify(serialized),
              prefix: surroundingText.prefix,
              suffix: surroundingText.suffix,
              articleId: props.article.id,
              overlapHighlightIdList: mergedIds.toArray(),
            })
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
          if (percent <= props.article.readingProgressPercent) {
            return
          }
          await articleReadingProgressMutation({
            id: props.article.id,
            readingProgressPercent: percent,
            readingProgressAnchorIndex: pageIndex,
          })
        }
      )
    })()

    return () => {
      PSPDFKit && container && PSPDFKit.unload(container)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  // We are intentially not setting exhaustive deps here, we only want to reload
  // the PSPDFKit instance if the theme, article URL, or page URL changes. Everything else
  // should be handled by the PSPDFKit instance callbacks.

  return (
    <Box css={{ width: '100%', height: '100%' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      {shareTarget && (
        <ShareHighlightModal
          url={getHighlightURL(shareTarget.shortId)}
          title={props.article.title}
          author={props.article.author}
          highlight={shareTarget}
          onOpenChange={() => {
            setShareTarget(undefined)
          }}
        />
      )}
      {props.showHighlightsModal && (
        <HighlightsModal
          highlights={props.article.highlights}
          onOpenChange={() => props.setShowHighlightsModal(false)}
        />
      )}
    </Box>
  )
}
