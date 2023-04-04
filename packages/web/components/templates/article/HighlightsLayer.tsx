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
  highlightIdAttribute,
  highlightNoteIdAttribute,
  SelectionAttributes,
} from '../../../lib/highlights/highlightHelpers'
import { HighlightBar, HighlightAction } from '../../patterns/HighlightBar'
import { removeHighlights } from '../../../lib/highlights/deleteHighlight'
import { createHighlight } from '../../../lib/highlights/createHighlight'
import { HighlightNoteModal } from './HighlightNoteModal'
import { NotebookModal } from './NotebookModal'
import { useCanShareNative } from '../../../lib/hooks/useCanShareNative'
import { showErrorToast } from '../../../lib/toastHelpers'
import { ArticleMutations } from '../../../lib/articleActions'
import { isTouchScreenDevice } from '../../../lib/deviceType'
import { SetLabelsModal } from './SetLabelsModal'
import { setLabelsForHighlight } from '../../../lib/networking/mutations/setLabelsForHighlight'
import { Label } from '../../../lib/networking/fragments/labelFragment'
import { UserBasicData } from '../../../lib/networking/queries/useGetViewerQuery'
import { ReadableItem } from '../../../lib/networking/queries/useGetLibraryItemsQuery'
import { useRouter } from 'next/router'
import { MarkdownModal } from '../../patterns/HighlightNotes'

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
  const router = useRouter()
  const [highlights, setHighlights] = useState(props.highlights)
  const [highlightModalAction, setHighlightModalAction] =
    useState<HighlightActionProps>({ highlightModalAction: 'none' })

  const [highlightLocations, setHighlightLocations] = useState<
    HighlightLocation[]
  >([])
  const focusedHighlightMousePos = useRef({ pageX: 0, pageY: 0 })

  const [focusedHighlight, setFocusedHighlight] =
    useState<Highlight | undefined>(undefined)

  const [selectionData, setSelectionData] = useSelection(highlightLocations)

  const [labelsTarget, setLabelsTarget] =
    useState<Highlight | undefined>(undefined)

  const canShareNative = useCanShareNative()

  const createHighlightFromSelection = async (
    selection: SelectionAttributes,
    note?: string
  ): Promise<Highlight | undefined> => {
    const result = await createHighlight(
      {
        selection: selection,
        articleId: props.articleId,
        existingHighlights: highlights,
        highlightStartEndOffsets: highlightLocations,
        annotation: note,
        highlightPositionPercent: selectionPercentPos(selection.selection),
        highlightPositionAnchorIndex: selectionAnchorIndex(selection.selection),
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
  }

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
        await props.articleMutations.deleteHighlightMutation(highlightId)

      if (didDeleteHighlight) {
        removeHighlights(
          highlights.map(($0) => $0.id),
          highlightLocations
        )
        setHighlights(highlights.filter(($0) => $0.id !== highlightId))
        setFocusedHighlight(undefined)
      } else {
        console.error('Failed to delete highlight')
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
          return await createHighlightFromSelection(inputs.selectionData, note)
        }
        setHighlightModalAction(inputs)
      }
    },
    [props.highlightBarDisabled]
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
    async (successAction: HighlightModalAction, annotation?: string) => {
      if (!selectionData) {
        return
      }
      try {
        const result = await createHighlightFromSelection(
          selectionData,
          annotation
        )
        if (!result) {
          showErrorToast('Error saving highlight', { position: 'bottom-right' })
          throw 'Error creating highlight'
        }
      } catch (error) {
        throw error
      }
    },
    [
      highlights,
      openNoteModal,
      props.articleId,
      selectionData,
      setSelectionData,
      canShareNative,
      highlightLocations,
    ]
  )

  // Detect mouseclick on a highlight -- call `setFocusedHighlight` when highlight detected
  const handleSingleClick = useCallback(
    (event: MouseEvent) => {
      const { target, pageX, pageY } = event

      if (!target || (target as Node)?.nodeType !== Node.ELEMENT_NODE) {
        console.log(' -- returning early from page tap')

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

          window?.webkit?.messageHandlers.viewerAction?.postMessage({
            actionID: 'showMenu',
            rectX: rect.x,
            rectY: rect.y,
            rectWidth: rect.width,
            rectHeight: rect.height,
          })

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
      } else {
        console.log('sending page tapped')
        window?.webkit?.messageHandlers.viewerAction?.postMessage({
          actionID: 'pageTapped',
        })
        setFocusedHighlight(undefined)
      }
    },
    [
      openNoteModal,
      highlights,
      highlightLocations,
      focusedHighlight,
      setFocusedHighlight,
    ]
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
        console.log('double tapped highlight: ', highlight)
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
        console.log('double tapped highlight with note: ', highlight)

        setFocusedHighlight(highlight)

        openNoteModal({
          highlight: highlight,
          highlightModalAction: 'addComment',
        })
      } else {
        setFocusedHighlight(undefined)
      }
    },
    [highlights, highlightLocations, focusedHighlight, openNoteModal]
  )

  const handleCloseNotebook = useCallback(
    (updatedHighlights: Highlight[], deletedHighlights: Highlight[]) => {
      props.setShowHighlightsModal(false)

      setHighlights(updatedHighlights)

      removeHighlights(
        deletedHighlights.map((h) => h.id),
        highlightLocations
      )

      updatedHighlights.forEach((h) => {
        updateHighlightsCallback(h)
      })
    },
    [highlights, highlightLocations]
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
    async (action: HighlightAction) => {
      switch (action) {
        case 'delete':
          await removeHighlightCallback()
          break
        case 'create':
          await createHighlightCallback('none')
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
      canShareNative,
      selectionData,
    ]
  )

  useEffect(() => {
    if (props.highlightOnRelease && selectionData?.wasDragEvent) {
      handleAction('create')
      setSelectionData(null)
    }
  }, [selectionData, setSelectionData])

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

  const dispatchHighlightMessage = (actionID: string) => {
    if (props.isAppleAppEmbed) {
      window?.webkit?.messageHandlers.highlightAction?.postMessage({
        actionID: actionID,
        highlightID: focusedHighlight?.id,
      })
    }
  }

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
          await createHighlightCallback('none', event.annotation)
          dispatchHighlightMessage('noteCreated')
        } catch (error) {
          dispatchHighlightError('saveAnnotation', error)
        }
      }
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

  if (labelsTarget) {
    return (
      <SetLabelsModal
        provider={labelsTarget}
        onOpenChange={function (): void {
          setLabelsTarget(undefined)
        }}
        save={function (labels: Label[]): Promise<Label[] | undefined> {
          const result = setLabelsForHighlight(
            labelsTarget.id,
            labels.map((label) => label.id)
          )
          return result
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
          displayAtBottom={isTouchScreenDevice()}
        />
      </>
    )
  }

  if (props.showHighlightsModal) {
    return (
      <NotebookModal
        viewer={props.viewer}
        item={props.item}
        highlights={highlights}
        onClose={handleCloseNotebook}
        viewHighlightInReader={(highlightId) => {
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
          props.setShowHighlightsModal(false)
        }}
      />
    )
  }

  return <></>
}
