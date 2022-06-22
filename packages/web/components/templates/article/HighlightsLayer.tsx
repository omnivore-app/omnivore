import { useEffect, useRef, useCallback, useState } from 'react'
import { makeHighlightStartEndOffset } from '../../../lib/highlights/highlightGenerator'
import type { HighlightLocation } from '../../../lib/highlights/highlightGenerator'
import { useSelection } from '../../../lib/highlights/useSelection'
import type { Highlight } from '../../../lib/networking/fragments/highlightFragment'
import {
  highlightIdAttribute,
  highlightNoteIdAttribute,
  SelectionAttributes,
} from '../../../lib/highlights/highlightHelpers'
import { HighlightBar, HighlightAction } from '../../patterns/HighlightBar'
import { removeHighlights } from '../../../lib/highlights/deleteHighlight'
import { createHighlight } from '../../../lib/highlights/createHighlight'
import { HighlightNoteModal } from './HighlightNoteModal'
import { ShareHighlightModal } from './ShareHighlightModal'
import { HighlightsModal } from './HighlightsModal'
import { useCanShareNative } from '../../../lib/hooks/useCanShareNative'
import { showErrorToast } from '../../../lib/toastHelpers'
import { ArticleMutations } from '../../../lib/articleActions'
import { isTouchScreenDevice } from '../../../lib/deviceType'

type HighlightsLayerProps = {
  highlights: Highlight[]
  articleId: string
  articleTitle: string
  articleAuthor: string
  isAppleAppEmbed: boolean
  highlightBarDisabled: boolean
  showHighlightsModal: boolean
  highlightsBaseURL: string
  setShowHighlightsModal: React.Dispatch<React.SetStateAction<boolean>>
  articleMutations: ArticleMutations
  highlightLocations: HighlightLocation[]
}

type HighlightModalAction = 'none' | 'addComment' | 'share'

type HighlightActionProps = {
  highlight?: Highlight
  selectionData?: SelectionAttributes
  highlightModalAction: HighlightModalAction
  createHighlightForNote?: (note?: string) => Promise<Highlight | undefined>
}

interface AnnotationEvent extends Event {
  annotation?: string
}

export function HighlightsLayer(props: HighlightsLayerProps): JSX.Element {
  const [highlights, setHighlights] = useState(props.highlights)
  const [highlightModalAction, setHighlightModalAction] =
    useState<HighlightActionProps>({ highlightModalAction: 'none' })

  const focusedHighlightMousePos = useRef({ pageX: 0, pageY: 0 })

  const [focusedHighlight, setFocusedHighlight] = useState<
    Highlight | undefined
  >(undefined)

  const [selectionData, setSelectionData] = useSelection(
    props.highlightLocations,
    false //noteModal.open,
  )

  const canShareNative = useCanShareNative()

  const removeHighlightCallback = useCallback(
    async (id?: string) => {
      const highlightId = id || focusedHighlight?.id
      if (!highlightId) return

      const didDeleteHighlight = await props.articleMutations.deleteHighlightMutation(highlightId)

      if (didDeleteHighlight) {
        removeHighlights(
          highlights.map(($0) => $0.id),
          props.highlightLocations
        )
        setHighlights(highlights.filter(($0) => $0.id !== highlightId))
        setFocusedHighlight(undefined)
      } else {
        console.error('Failed to delete highlight')
      }
    },
    [focusedHighlight, highlights, props.highlightLocations]
  )

  const updateHighlightsCallback = useCallback(
    (highlight: Highlight) => {
      removeHighlights([highlight.id], props.highlightLocations)
      const keptHighlights = highlights.filter(($0) => $0.id !== highlight.id)
      setHighlights([...keptHighlights, highlight])
    },
    [highlights, props.highlightLocations]
  )

  const handleNativeShare = useCallback(
    (highlightID: string) => {
      navigator
        ?.share({
          title: props.articleTitle,
          url: `${props.highlightsBaseURL}/${highlightID}`,
        })
        .then(() => {
          setFocusedHighlight(undefined)
        })
        .catch((error) => {
          console.log(error)
          setFocusedHighlight(undefined)
        })
    },
    [props.articleTitle, props.highlightsBaseURL]
  )

  const openNoteModal = useCallback(
    (inputs: HighlightActionProps) => {
      // First try to send a signal to the ios app
      if (
        typeof window?.webkit?.messageHandlers.highlightAction != 'undefined' &&
        props.highlightBarDisabled
      ) {
        window?.webkit?.messageHandlers.highlightAction?.postMessage({
          actionID: 'annotate',
          annotation: inputs.highlight?.annotation ?? '',
        })
      } else {
        inputs.createHighlightForNote = async (note?: string) => {
          if (!inputs.selectionData) {
            return undefined
          }
          return await createHighlightFromSelection(inputs.selectionData, note)
        }
        setHighlightModalAction(inputs)
      }
    },
    [props.highlightBarDisabled]
  )

  const createHighlightFromSelection = async (
    selection: SelectionAttributes,
    note?: string
  ): Promise<Highlight | undefined> => {
    const result = await createHighlight({
      selection: selection,
      articleId: props.articleId,
      existingHighlights: highlights,
      highlightStartEndOffsets: props.highlightLocations,
      annotation: note,
    }, props.articleMutations)

    if (!result.highlights || result.highlights.length == 0) {
      // TODO: show an error message
      console.error('Failed to create highlight')
      return undefined
    }

    setSelectionData(null)
    setHighlights(result.highlights)

    if (result.newHighlightIndex === undefined) {
      setHighlightModalAction({ highlightModalAction: 'none' })
      return undefined
    }

    return result.highlights[result.newHighlightIndex]
  }

  const createHighlightCallback = useCallback(
    async (successAction: HighlightModalAction, annotation?: string) => {
      if (!selectionData) {
        return
      }
      const result = await createHighlightFromSelection(
        selectionData,
        annotation
      )
      if (!result) {
        showErrorToast('Error saving highlight', { position: 'bottom-right' })
      }
      // if (successAction === 'share' && canShareNative) {
      //   handleNativeShare(highlight.shortId)
      //   return
      // } else {
      //   setFocusedHighlight(undefined)
      // }

      // if (successAction === 'addComment') {
      //   openNoteModal({
      //     highlightModalAction: 'addComment',
      //     highlight,
      //   })
      // }
    },
    [
      handleNativeShare,
      highlights,
      openNoteModal,
      props.articleId,
      selectionData,
      setSelectionData,
      canShareNative,
      props.highlightLocations,
    ]
  )

  const scrollToHighlight = (id: string) => {
    const foundElement = document.querySelector(`[omnivore-highlight-id="${id}"]`)
    if(foundElement){
      foundElement.scrollIntoView({
        block: 'center',
        behavior: 'smooth'
      })
      window.location.hash = `#${id}`
      props.setShowHighlightsModal(false)
    }
  }

  // Detect mouseclick on a highlight -- call `setFocusedHighlight` when highlight detected
  const handleClickHighlight = useCallback(
    (event: MouseEvent) => {
      const { target, pageX, pageY } = event

      if (!target || (target as Node)?.nodeType !== Node.ELEMENT_NODE) {
        return
      }

      focusedHighlightMousePos.current = { pageX, pageY }

      if ((target as Element).hasAttribute(highlightIdAttribute)) {
        const id = (target as HTMLSpanElement).getAttribute(
          highlightIdAttribute
        )
        const highlight = highlights.find(($0) => $0.id === id)

        // FIXME: Apply note preview opening on the note icon click only

        if (highlight) {
          // In the native app we post a message with the rect of the
          // highlight, so the app can display a native menu
          const rect = (target as Element).getBoundingClientRect()
          window?.webkit?.messageHandlers.viewerAction?.postMessage({
            actionID: 'showMenu',
            rectX: rect.x,
            rectY: rect.y,
            rectWidth: rect.width,
            rectHeight: rect.height,
          })
          setFocusedHighlight(highlight)
        }
      } else if ((target as Element).hasAttribute(highlightNoteIdAttribute)) {
        const id = (target as HTMLSpanElement).getAttribute(
          highlightNoteIdAttribute
        )
        const highlight = highlights.find(($0) => $0.id === id)
        openNoteModal({
          highlight: highlight,
          highlightModalAction: 'addComment',
        })
      } else setFocusedHighlight(undefined)
    },
    [highlights, props.highlightLocations]
  )

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    document.addEventListener('click', handleClickHighlight)

    return () => document.removeEventListener('click', handleClickHighlight)
  }, [handleClickHighlight])

  const handleAction = useCallback(
    (action: HighlightAction) => {
      switch (action) {
        case 'delete':
          removeHighlightCallback()
          break
        case 'create':
          createHighlightCallback('none')
          break
        case 'comment':
          if (props.highlightBarDisabled || focusedHighlight) {
            openNoteModal({
              highlight: focusedHighlight,
              highlightModalAction: 'addComment',
            })
          } else {
            openNoteModal({
              highlight: undefined,
              selectionData: selectionData || undefined,
              highlightModalAction: 'addComment',
            })
          }
          break
        case 'share':
          if (props.isAppleAppEmbed) {
            // send action to native app (naive app doesn't handle this yet so it's a no-op)
            window?.webkit?.messageHandlers.highlightAction?.postMessage({
              actionID: 'share',
              highlightID: focusedHighlight?.id,
            })
          }

          if (focusedHighlight) {
            if (canShareNative) {
              handleNativeShare(focusedHighlight.shortId)
            } else {
              setHighlightModalAction({
                highlight: focusedHighlight,
                highlightModalAction: 'share',
              })
            }
          } else {
            createHighlightCallback('share')
          }
          break
        case 'unshare':
          console.log('unshare')
          break // TODO: implement -- need to show confirmation dialog
      }
    },
    [
      createHighlightCallback,
      focusedHighlight,
      handleNativeShare,
      openNoteModal,
      props.highlightBarDisabled,
      props.isAppleAppEmbed,
      removeHighlightCallback,
      canShareNative,
    ]
  )

  useEffect(() => {
    const annotate = () => {
      handleAction('comment')
    }

    const highlight = () => {
      handleAction('create')
    }

    const share = () => {
      handleAction('share')
    }

    const remove = () => {
      handleAction('delete')
    }

    const dismissHighlight = () => {
      setFocusedHighlight(undefined)
    }

    const copy = async () => {
      if (focusedHighlight) {
        await navigator.clipboard.writeText(focusedHighlight.quote)
        setFocusedHighlight(undefined)
      }
    }

    const saveAnnotation = async (event: AnnotationEvent) => {
      if (focusedHighlight) {
        const annotation = event.annotation ?? ''

        const result = await props.articleMutations.updateHighlightMutation({
          highlightId: focusedHighlight.id,
          annotation: event.annotation ?? '',
        })

        if (result) {
          updateHighlightsCallback({ ...focusedHighlight, annotation })
        } else {
          console.log(
            'failed to change annotation for highlight with id',
            focusedHighlight.id
          )
        }
        setFocusedHighlight(undefined)
      } else {
        createHighlightCallback('none', event.annotation)
      }
    }

    document.addEventListener('annotate', annotate)
    document.addEventListener('highlight', highlight)
    document.addEventListener('share', share)
    document.addEventListener('remove', remove)
    document.addEventListener('copyHighlight', copy)
    document.addEventListener('dismissHighlight', dismissHighlight)
    document.addEventListener('saveAnnotation', saveAnnotation)

    return () => {
      document.removeEventListener('annotate', annotate)
      document.removeEventListener('highlight', highlight)
      document.removeEventListener('share', share)
      document.removeEventListener('remove', remove)
      document.removeEventListener('copyHighlight', copy)
      document.removeEventListener('dismissHighlight', dismissHighlight)
      document.removeEventListener('saveAnnotation', saveAnnotation)
    }
  })

  if (highlightModalAction?.highlightModalAction == 'addComment') {
    return (
      <HighlightNoteModal
        highlight={highlightModalAction.highlight}
        author={props.articleAuthor}
        title={props.articleTitle}
        onUpdate={updateHighlightsCallback}
        onOpenChange={() =>
          setHighlightModalAction({ highlightModalAction: 'none' })
        }
        createHighlightForNote={highlightModalAction?.createHighlightForNote}
      />
    )
  }

  if (
    highlightModalAction?.highlightModalAction == 'share' &&
    highlightModalAction.highlight
  ) {
    return (
      <ShareHighlightModal
        url={`${props.highlightsBaseURL}/${highlightModalAction.highlight.shortId}`}
        title={props.articleTitle}
        author={props.articleAuthor}
        highlight={highlightModalAction.highlight}
        onOpenChange={() => {
          setHighlightModalAction({ highlightModalAction: 'none' })
        }}
      />
    )
  }

  // Display the button bar if we are not in the native app and there
  // is a focused highlight or selection data
  if (!props.highlightBarDisabled && (focusedHighlight || selectionData)) {
    const anchorCoordinates = () => {
      return {
        pageX:
          focusedHighlightMousePos.current?.pageX ??
          selectionData?.focusPosition.x ??
          0,
        pageY:
          focusedHighlightMousePos.current?.pageY ??
          selectionData?.focusPosition.y ??
          0,
      }
    }

    return (
      <>
        <HighlightBar
          anchorCoordinates={anchorCoordinates()}
          isNewHighlight={!!selectionData}
          handleButtonClick={handleAction}
          isSharedToFeed={focusedHighlight?.sharedAt != undefined}
          isTouchscreenDevice={isTouchScreenDevice()}
        />
      </>
    )
  }

  if (props.showHighlightsModal) {
    return (
      <HighlightsModal
      highlights={highlights}
      onOpenChange={() => props.setShowHighlightsModal(false)}
      scrollToHighlight={scrollToHighlight}
      deleteHighlightAction={(highlightId: string) => {
          removeHighlightCallback(highlightId)
        }}
      />
    )
  }

  return <></>
}
