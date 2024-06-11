import {
  useEffect,
  useRef,
  useCallback,
  useState,
  MutableRefObject,
} from 'react'
import { makeHighlightStartEndOffset } from '../../../lib/highlights/highlightGenerator'
import type { HighlightLocation } from '../../../lib/highlights/highlightGenerator'
import { useSelection } from '../../../lib/highlights/useSelection'
import type { Highlight } from '../../../lib/networking/fragments/highlightFragment'
import {
  getHighlightElements,
  highlightIdAttribute,
  highlightLabelIdAttribute,
  highlightNoteIdAttribute,
  SelectionAttributes,
} from '../../../lib/highlights/highlightHelpers'
import { HighlightBar, HighlightAction } from '../../patterns/HighlightBar'
import { removeHighlights } from '../../../lib/highlights/deleteHighlight'
import { createHighlight } from '../../../lib/highlights/createHighlight'
import { HighlightNoteModal } from './HighlightNoteModal'
import { showErrorToast, showSuccessToast } from '../../../lib/toastHelpers'
import { ArticleMutations } from '../../../lib/articleActions'
import { isTouchScreenDevice } from '../../../lib/deviceType'
import { UserBasicData } from '../../../lib/networking/queries/useGetViewerQuery'
import { ReadableItem } from '../../../lib/networking/queries/useGetLibraryItemsQuery'
import { SetHighlightLabelsModalPresenter } from './SetLabelsModalPresenter'
import 'react-sliding-pane/dist/react-sliding-pane.css'
import { NotebookContent } from './Notebook'
import { NotebookHeader } from './NotebookHeader'
import useGetWindowDimensions from '../../../lib/hooks/useGetWindowDimensions'
import { ConfirmationModal } from '../../patterns/ConfirmationModal'
import { ResizableSidebar } from './ResizableSidebar'

type HighlightsLayerProps = {
  viewer: UserBasicData

  item: ReadableItem
  highlights: Highlight[]

  articleId: string
  articleTitle: string
  articleAuthor: string
  isAppleAppEmbed: boolean
  highlightBarDisabled: boolean
  showHighlightsModal: boolean
  highlightOnRelease?: boolean
  scrollToHighlight: MutableRefObject<string | null>

  setShowHighlightsModal: React.Dispatch<React.SetStateAction<boolean>>
  articleMutations: ArticleMutations
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

interface SpeakingSectionEvent extends Event {
  anchorIdx?: string
}

export function HighlightsLayer(props: HighlightsLayerProps): JSX.Element {
  const [highlights, setHighlights] = useState(props.highlights)
  const [highlightModalAction, setHighlightModalAction] =
    useState<HighlightActionProps>({ highlightModalAction: 'none' })

  const [highlightLocations, setHighlightLocations] = useState<
    HighlightLocation[]
  >([])
  const focusedHighlightMousePos = useRef({ pageX: 0, pageY: 0 })

  const [currentHighlightIdx, setCurrentHighlightIdx] = useState(0)
  const [focusedHighlight, setFocusedHighlight] = useState<
    Highlight | undefined
  >(undefined)

  const [selectionData, setSelectionData] = useSelection(highlightLocations)

  const [labelsTarget, setLabelsTarget] = useState<Highlight | undefined>(
    undefined
  )

  const [
    confirmDeleteHighlightWithNoteId,
    setConfirmDeleteHighlightWithNoteId,
  ] = useState<string | undefined>(undefined)

  const windowDimensions = useGetWindowDimensions()

  const createHighlightFromSelection = useCallback(
    async (
      selection: SelectionAttributes,
      options: { annotation?: string; color?: string } | undefined
    ): Promise<Highlight | undefined> => {
      const result = await createHighlight(
        {
          selection: selection,
          articleId: props.articleId,
          existingHighlights: highlights,
          color: options?.color,
          highlightStartEndOffsets: highlightLocations,
          annotation: options?.annotation,
          highlightPositionPercent: selectionPercentPos(selection.selection),
          highlightPositionAnchorIndex: selectionAnchorIndex(
            selection.selection
          ),
        },
        props.articleMutations
      )

      if (result.errorMessage) {
        throw 'Failed to create highlight: ' + result.errorMessage
      }

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
    },
    [
      highlightLocations,
      highlights,
      props.articleId,
      props.articleMutations,
      setSelectionData,
    ]
  )

  // Load the highlights
  useEffect(() => {
    const res: HighlightLocation[] = []
    highlights
      .filter((h) => h.type == 'HIGHLIGHT')
      .forEach((highlight) => {
        try {
          const offset = makeHighlightStartEndOffset(highlight)
          res.push(offset)
        } catch (err) {
          console.error(err)
        }
      })
    setHighlightLocations(res)

    // If we were given an initial highlight to scroll to we do
    // that now that all the content has been injected into the
    // page.
    if (props.scrollToHighlight.current) {
      const anchorElement = document.querySelector(
        `[omnivore-highlight-id="${props.scrollToHighlight.current}"]`
      )
      if (anchorElement) {
        anchorElement.scrollIntoView({
          block: 'center',
          behavior: 'auto',
        })
      }
    }
  }, [highlights, setHighlightLocations, props.scrollToHighlight])

  const removeHighlightCallback = useCallback(
    async (id?: string) => {
      const highlightId = id || focusedHighlight?.id

      if (!highlightId) {
        console.trace('Failed to identify highlight to be removed')
        return
      }

      const didDeleteHighlight =
        await props.articleMutations.deleteHighlightMutation(
          props.articleId,
          highlightId
        )

      if (didDeleteHighlight) {
        removeHighlights(
          highlights.map(($0) => $0.id),
          highlightLocations
        )
        setHighlights(highlights.filter(($0) => $0.id !== highlightId))
        setFocusedHighlight(undefined)
        document.dispatchEvent(new Event('highlightsUpdated'))
        showSuccessToast('Highlight removed')
      } else {
        console.error('Failed to delete highlight')
        showErrorToast('Error removing highlight')
      }
    },
    [focusedHighlight, highlights, highlightLocations, props.articleMutations]
  )

  const updateHighlightsCallback = useCallback(
    (highlight: Highlight) => {
      removeHighlights([highlight.id], highlightLocations)
      const keptHighlights = highlights.filter(($0) => $0.id !== highlight.id)
      setHighlights([...keptHighlights, highlight])
    },
    [highlights, highlightLocations]
  )

  const updateHighlightColor = useCallback(
    (highlight: Highlight, color: string) => {
      const initial = highlight.color
      highlight.color = color
      updateHighlightsCallback(highlight)
      ;(async () => {
        const update = await props.articleMutations.updateHighlightMutation({
          libraryItemId: props.articleId,
          highlightId: highlight.id,
          color: color,
        })
        if (!update) {
          highlight.color = initial
          updateHighlightsCallback(highlight)
          showErrorToast('Error updating highlight color')
        }
        document.dispatchEvent(new Event('highlightsUpdated'))
      })()
    },
    [props, highlights, highlightLocations, updateHighlightsCallback]
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
      } else if (typeof window?.AndroidWebKitMessenger != 'undefined') {
        window.AndroidWebKitMessenger.handleIdentifiableMessage(
          'annotate',
          JSON.stringify({ annotation: inputs.highlight?.annotation ?? '' })
        )
      } else {
        inputs.createHighlightForNote = async (note?: string) => {
          if (!inputs.selectionData) {
            return undefined
          }
          return await createHighlightFromSelection(inputs.selectionData, {
            annotation: note,
          })
        }
        setHighlightModalAction(inputs)
      }
      document.dispatchEvent(new Event('highlightsUpdated'))
    },
    [props.highlightBarDisabled, createHighlightFromSelection]
  )

  const selectionPercentPos = (selection: Selection): number | undefined => {
    const containerRect = document
      .getElementById('readability-page-1')
      ?.getBoundingClientRect()
    if (selection.rangeCount > 0 && containerRect) {
      const selectionTop = selection.getRangeAt(0).getBoundingClientRect().y
      const relativeTop = selectionTop - containerRect.y
      const percent = relativeTop / containerRect.height

      return Math.min(Math.max(0, percent * 100), 100)
    }
    return undefined
  }

  const selectionAnchorIndex = (selection: Selection): number | undefined => {
    if (selection.rangeCount > 0) {
      const containerElement = () => {
        const node = selection.getRangeAt(0).startContainer
        if (node.nodeType == Node.ELEMENT_NODE) {
          return node as HTMLElement
        }
        return node.parentElement
      }
      let walk = containerElement()
      while (walk) {
        const idx = Number(walk.getAttribute('data-omnivore-anchor-idx'))
        if (idx > 0) {
          return idx
        }
        walk = walk.parentElement
      }
    }
    return undefined
  }

  const createHighlightCallback = useCallback(
    async (options: { annotation?: string; color?: string } | undefined) => {
      if (!selectionData) {
        return
      }
      try {
        const result = await createHighlightFromSelection(
          selectionData,
          options
        )
        if (!result) {
          showErrorToast('Error saving highlight', { position: 'bottom-right' })
          throw 'Error creating highlight'
        }
      } catch (error) {
        throw error
      }
    },
    [selectionData, createHighlightFromSelection]
  )

  // Detect mouseclick on a highlight -- call `setFocusedHighlight` when highlight detected
  const handleSingleClick = useCallback(
    (event: MouseEvent) => {
      const { target, pageX, pageY } = event

      if (!target || (target as Node)?.nodeType !== Node.ELEMENT_NODE) {
        return
      }

      const tapAttributes = {
        tapX: event.clientX,
        tapY: event.clientY,
      }

      window?.AndroidWebKitMessenger?.handleIdentifiableMessage(
        'userTap',
        JSON.stringify(tapAttributes)
      )

      focusedHighlightMousePos.current = { pageX, pageY }

      if ((target as Element).hasAttribute(highlightIdAttribute)) {
        const id = (target as HTMLSpanElement).getAttribute(
          highlightIdAttribute
        )
        const highlight = highlights.find(($0) => $0.id === id)

        // FIXME: Apply note preview opening on the note icon click only

        if (highlight) {
          setFocusedHighlight(highlight)

          // In the native app we post a message with the rect of the
          // highlight, so the app can display a native menu
          const rect = (target as Element).getBoundingClientRect()

          if (window?.webkit?.messageHandlers) {
            window?.webkit?.messageHandlers.viewerAction?.postMessage({
              actionID: 'showMenu',
              rectX: rect.x,
              rectY: rect.y,
              rectWidth: rect.width,
              rectHeight: rect.height,
            })
          }

          window?.AndroidWebKitMessenger?.handleIdentifiableMessage(
            'existingHighlightTap',
            JSON.stringify({ ...tapAttributes })
          )
        }
      } else if ((target as Element).hasAttribute(highlightNoteIdAttribute)) {
        const id = (target as HTMLSpanElement).getAttribute(
          highlightNoteIdAttribute
        )
        const highlight = highlights.find(($0) => $0.id === id)
        setFocusedHighlight(highlight)

        openNoteModal({
          highlight: highlight,
          highlightModalAction: 'addComment',
        })
      } else if ((target as Element).hasAttribute(highlightLabelIdAttribute)) {
        const id = (target as HTMLSpanElement).getAttribute(
          highlightLabelIdAttribute
        )
        const highlight = highlights.find(($0) => $0.id === id)
        setFocusedHighlight(highlight)
        setLabelsTarget(highlight)
      } else if (window?.webkit?.messageHandlers) {
        window?.webkit?.messageHandlers.viewerAction?.postMessage({
          actionID: 'pageTapped',
        })
        setFocusedHighlight(undefined)
      }
    },
    [openNoteModal, highlights, setLabelsTarget]
  )

  const handleDoubleClick = useCallback(
    (event: MouseEvent) => {
      const { target } = event

      if (!target || (target as Node)?.nodeType !== Node.ELEMENT_NODE) {
        return
      }

      if ((target as Element).hasAttribute(highlightIdAttribute)) {
        const id = (target as HTMLSpanElement).getAttribute(
          highlightIdAttribute
        )
        const highlight = highlights.find(($0) => $0.id === id)
        setFocusedHighlight(highlight)

        openNoteModal({
          highlight: highlight,
          highlightModalAction: 'addComment',
        })
      } else if ((target as Element).hasAttribute(highlightNoteIdAttribute)) {
        const id = (target as HTMLSpanElement).getAttribute(
          highlightNoteIdAttribute
        )
        const highlight = highlights.find(($0) => $0.id === id)
        setFocusedHighlight(highlight)

        openNoteModal({
          highlight: highlight,
          highlightModalAction: 'addComment',
        })
      } else {
        setFocusedHighlight(undefined)
      }
    },
    [highlights, openNoteModal]
  )

  const handleCloseNotebook = useCallback(
    (updatedHighlights: Highlight[]) => {
      props.setShowHighlightsModal(false)

      // Remove all the existing highlights, then set the new ones
      removeHighlights(
        highlights.map((h) => h.id),
        highlightLocations
      )

      setHighlights([...updatedHighlights])
    },
    [highlights, highlightLocations, props, setHighlights]
  )

  useEffect(() => {
    let clickCount = 0
    const handleClick = (e: MouseEvent) => {
      clickCount += 1

      setTimeout(() => {
        if (clickCount === 1) handleSingleClick(e)
        else if (clickCount === 2) handleDoubleClick(e)

        clickCount = 0
      }, 250)
    }

    // Add event listener for click events
    document.addEventListener('click', handleClick)

    // Remove event listener
    return () => {
      document.removeEventListener('click', handleClick)
    }
  }, [handleSingleClick, handleDoubleClick])

  const handleAction = useCallback(
    async (action: HighlightAction, param?: string) => {
      switch (action) {
        case 'delete':
          if ((focusedHighlight?.annotation ?? '').length === 0) {
            await removeHighlightCallback()
          } else {
            setConfirmDeleteHighlightWithNoteId(focusedHighlight?.id)
          }
          break
        case 'create':
          await createHighlightCallback({
            color: param,
          })
          break
        case 'updateColor':
          if (focusedHighlight && param) {
            updateHighlightColor(focusedHighlight, param)
          } else {
            showErrorToast('Error updating color')
          }
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
        case 'copy': {
          const selection = window.getSelection()
          if (selection === null) return

          const userSelectionText = selection.toString()
          let textToCopy = ''

          if (focusedHighlight) {
            const highlightedElements = getHighlightElements(
              focusedHighlight.id
            )
            highlightedElements.forEach(
              (element) => (textToCopy += element.textContent)
            )
          } else if (userSelectionText) {
            textToCopy = userSelectionText
          }

          if (textToCopy) {
            try {
              await navigator.clipboard.writeText(textToCopy)
              showSuccessToast(
                focusedHighlight ? 'Highlight copied' : 'Text copied',
                {
                  position: 'bottom-right',
                }
              )
            } catch (error) {
              showErrorToast('Error copying highlight, permission denied.', {
                position: 'bottom-right',
              })
            }
          }

          selection.empty()
          setSelectionData(null)
          break
        }
        case 'setHighlightLabels':
          if (props.isAppleAppEmbed) {
            window?.webkit?.messageHandlers.highlightAction?.postMessage({
              actionID: 'setHighlightLabels',
              highlightID: focusedHighlight?.id,
            })
          } else {
            setLabelsTarget(focusedHighlight)
          }
          break
      }
    },
    [
      createHighlightCallback,
      focusedHighlight,
      openNoteModal,
      props.highlightBarDisabled,
      props.isAppleAppEmbed,
      removeHighlightCallback,
      selectionData,
      setSelectionData,
      updateHighlightColor,
    ]
  )

  useEffect(() => {
    if (props.highlightOnRelease) {
      handleAction('create')
      setSelectionData(null)
    }
  }, [selectionData, setSelectionData, handleAction, props.highlightOnRelease])

  const dispatchHighlightError = (action: string, error: unknown) => {
    if (props.isAppleAppEmbed) {
      window?.webkit?.messageHandlers.highlightAction?.postMessage({
        actionID: 'highlightError',
        highlightAction: action,
        highlightID: focusedHighlight?.id,
        error: typeof error === 'string' ? error : JSON.stringify(error),
      })
    }
  }

  useEffect(() => {
    setFocusedHighlight(undefined)
  }, [selectionData])

  const dispatchHighlightMessage = (actionID: string) => {
    if (props.isAppleAppEmbed) {
      window?.webkit?.messageHandlers.highlightAction?.postMessage({
        actionID: actionID,
        highlightID: focusedHighlight?.id,
      })
    }
  }

  const deleteHighlightById = useCallback(
    (event: Event) => {
      const annotationId = (event as CustomEvent).detail as string
      if (annotationId) {
        removeHighlights(
          highlights.map((h) => h.id),
          highlightLocations
        )
        const keptHighlights = highlights.filter(($0) => $0.id !== annotationId)
        setHighlights([...keptHighlights])
      }
    },
    [highlights, highlightLocations]
  )

  useEffect(() => {
    const safeHandleAction = async (action: HighlightAction) => {
      try {
        await handleAction(action)
      } catch (error) {
        dispatchHighlightError(action, error)
      }
    }

    const annotate = async () => {
      await safeHandleAction('comment')
    }

    const highlight = async () => {
      await safeHandleAction('create')
    }

    const share = async () => {
      await safeHandleAction('share')
    }

    const remove = async () => {
      await safeHandleAction('delete')
    }

    const dismissHighlight = () => {
      setFocusedHighlight(undefined)
    }

    const setHighlightLabels = () => {
      handleAction('setHighlightLabels')
    }

    const goToNextHighlight = () => {
      const highlightsList = highlights.filter((h) => h.type == 'HIGHLIGHT')
      const next = Math.min(currentHighlightIdx + 1, highlightsList.length - 1)
      goToHighlightIdx(next, highlightsList)
    }

    const goToPreviousHighlight = () => {
      const highlightsList = highlights.filter((h) => h.type == 'HIGHLIGHT')
      const prev = Math.max(currentHighlightIdx - 1, 0)
      goToHighlightIdx(prev, highlightsList)
    }

    const goToHighlightIdx = (idx: number, highlightsList: Highlight[]) => {
      const highlight = highlightsList[idx]
      const target = document.querySelector(
        `[omnivore-highlight-id="${highlight.id}"]`
      )
      target?.scrollIntoView({
        block: 'center',
        behavior: 'smooth',
      })
      setCurrentHighlightIdx(idx)
    }

    const copy = async () => {
      if (focusedHighlight && focusedHighlight.quote) {
        if (window.AndroidWebKitMessenger) {
          window.AndroidWebKitMessenger.handleIdentifiableMessage(
            'writeToClipboard',
            JSON.stringify({ quote: focusedHighlight.quote })
          )
        } else {
          await navigator.clipboard.writeText(focusedHighlight.quote)
        }

        setFocusedHighlight(undefined)
      }
    }

    const speakingSection = async (event: SpeakingSectionEvent) => {
      const item = document.querySelector(
        `[data-omnivore-anchor-idx="${event.anchorIdx}"]`
      )
      const otherItems = document.querySelectorAll('.speakingSection')
      otherItems.forEach((other) => {
        if (other != item) {
          other?.classList.remove('speakingSection')
        }
      })
      item?.classList.add('speakingSection')
      // item?.scrollIntoView()
    }

    const saveAnnotation = async (event: AnnotationEvent) => {
      if (focusedHighlight) {
        const annotation = event.annotation ?? ''

        const result = await props.articleMutations.updateHighlightMutation({
          libraryItemId: props.articleId,
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
          dispatchHighlightError(
            'saveAnnotation',
            'Failed to create highlight.'
          )
        }
        setFocusedHighlight(undefined)
        dispatchHighlightMessage('noteCreated')
      } else {
        try {
          await createHighlightCallback({
            annotation: event.annotation,
          })
          dispatchHighlightMessage('noteCreated')
        } catch (error) {
          dispatchHighlightError('saveAnnotation', error)
        }
      }
      document.dispatchEvent(new Event('highlightsUpdated'))
    }

    document.addEventListener('annotate', annotate)
    document.addEventListener('highlight', highlight)
    document.addEventListener('share', share)
    document.addEventListener('remove', remove)
    document.addEventListener('copyHighlight', copy)
    document.addEventListener('dismissHighlight', dismissHighlight)
    document.addEventListener('saveAnnotation', saveAnnotation)
    document.addEventListener('speakingSection', speakingSection)
    document.addEventListener('setHighlightLabels', setHighlightLabels)
    document.addEventListener('scrollToNextHighlight', goToNextHighlight)
    document.addEventListener('scrollToPrevHighlight', goToPreviousHighlight)
    document.addEventListener('deleteHighlightbyId', deleteHighlightById)

    return () => {
      document.removeEventListener('annotate', annotate)
      document.removeEventListener('highlight', highlight)
      document.removeEventListener('share', share)
      document.removeEventListener('remove', remove)
      document.removeEventListener('copyHighlight', copy)
      document.removeEventListener('dismissHighlight', dismissHighlight)
      document.removeEventListener('saveAnnotation', saveAnnotation)
      document.removeEventListener('speakingSection', speakingSection)
      document.removeEventListener('setHighlightLabels', setHighlightLabels)
      document.removeEventListener('scrollToNextHighlight', goToNextHighlight)
      document.removeEventListener(
        'scrollToPrevHighlight',
        goToPreviousHighlight
      )
      document.removeEventListener('deleteHighlightbyId', deleteHighlightById)
    }
  })

  const anchorCoordinates = () => {
    return {
      pageX:
        selectionData?.focusPosition.x ??
        focusedHighlightMousePos.current?.pageX ??
        0,
      pageY:
        selectionData?.focusPosition.y ??
        focusedHighlightMousePos.current?.pageY ??
        0,
    }
  }

  return (
    <>
      {highlightModalAction?.highlightModalAction == 'addComment' && (
        <HighlightNoteModal
          highlight={highlightModalAction.highlight}
          author={props.articleAuthor}
          title={props.articleTitle}
          libraryItemId={props.articleId}
          onUpdate={updateHighlightsCallback}
          onOpenChange={() =>
            setHighlightModalAction({ highlightModalAction: 'none' })
          }
          createHighlightForNote={highlightModalAction?.createHighlightForNote}
        />
      )}
      {labelsTarget && (
        <SetHighlightLabelsModalPresenter
          highlight={labelsTarget}
          highlightId={labelsTarget.id}
          onUpdate={updateHighlightsCallback}
          onOpenChange={() => {
            setLabelsTarget(undefined)
          }}
        />
      )}
      {confirmDeleteHighlightWithNoteId && (
        <ConfirmationModal
          message="Are you sure you want to delete this highlight? The note associated with it will also be deleted."
          onAccept={() => {
            ;(async () => {
              await removeHighlightCallback(confirmDeleteHighlightWithNoteId)
              setConfirmDeleteHighlightWithNoteId(undefined)
            })()
          }}
          onOpenChange={() => {
            setConfirmDeleteHighlightWithNoteId(undefined)
          }}
        />
      )}
      {/* // Display the button bar if we are not in the native app and there // is
      a focused highlight or selection data */}
      {!props.highlightBarDisabled && (focusedHighlight || selectionData) && (
        <>
          <HighlightBar
            anchorCoordinates={anchorCoordinates()}
            isNewHighlight={!!selectionData}
            handleButtonClick={handleAction}
            isSharedToFeed={focusedHighlight?.sharedAt != undefined}
            displayAtBottom={isTouchScreenDevice()}
            highlightColor={focusedHighlight?.color ?? 'yellow'}
          />
        </>
      )}
      <ResizableSidebar
        isShow={props.showHighlightsModal}
        onClose={() => {
          props.setShowHighlightsModal(false)
        }}
      >
        <NotebookHeader
          viewer={props.viewer}
          item={props.item}
          setShowNotebook={props.setShowHighlightsModal}
        />
        <NotebookContent
          viewer={props.viewer}
          item={props.item}
          // highlights={highlights}
          // onClose={handleCloseNotebook}
          viewInReader={(highlightId) => {
            // The timeout here is a bit of a hack to work around rerendering
            setTimeout(() => {
              const target = document.querySelector(
                `[omnivore-highlight-id="${highlightId}"]`
              )
              target?.scrollIntoView({
                block: 'center',
                behavior: 'auto',
              })
            }, 1)
            history.replaceState(
              undefined,
              window.location.href,
              `#${highlightId}`
            )
          }}
        />
      </ResizableSidebar>
    </>
  )
}
