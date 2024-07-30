import { useCallback, useEffect } from 'react'
import { useSetPageLabels } from '../../../lib/hooks/useSetPageLabels'
import { LabelsProvider } from './SetLabelsControl'
import { SetLabelsModal } from './SetLabelsModal'
import { useSetHighlightLabels } from '../../../lib/hooks/useSetHighlightLabels'
import { Highlight } from '../../../lib/networking/fragments/highlightFragment'
import { LibraryItemNode } from '../../../lib/networking/library_items/useLibraryItems'

type SetPageLabelsModalPresenterProps = {
  libraryItem: LibraryItemNode
  onOpenChange: (open: boolean) => void
}

export function SetPageLabelsModalPresenter(
  props: SetPageLabelsModalPresenterProps
): JSX.Element {
  const [labels, dispatchLabels] = useSetPageLabels(
    props.libraryItem.id,
    props.libraryItem.slug
  )

  const onOpenChange = useCallback(() => {
    if (props.libraryItem) {
      props.libraryItem.labels = labels.labels
    }
    props.onOpenChange(true)
  }, [props, labels])

  useEffect(() => {
    dispatchLabels({
      type: 'RESET',
      labels: props.libraryItem.labels ?? [],
    })
  }, [props.libraryItem, dispatchLabels])

  return (
    <SetLabelsModal
      provider={props.libraryItem}
      selectedLabels={labels.labels}
      dispatchLabels={dispatchLabels}
      onOpenChange={onOpenChange}
    />
  )
}

type SetHighlightLabelsModalPresenterProps = {
  highlightId: string
  highlight: Highlight

  onUpdate: (updatedHighlight: Highlight) => void
  onOpenChange: (open: boolean) => void
}

export function SetHighlightLabelsModalPresenter(
  props: SetHighlightLabelsModalPresenterProps
): JSX.Element {
  const [labels, dispatchLabels] = useSetHighlightLabels(props.highlightId)

  useEffect(() => {
    dispatchLabels({
      type: 'RESET',
      labels: props.highlight.labels ?? [],
    })
  }, [props.highlight, dispatchLabels])

  const onOpenChange = useCallback(() => {
    props.highlight.labels = labels.labels
    props.onUpdate(props.highlight)
    props.onOpenChange(true)
  }, [props])

  return (
    <SetLabelsModal
      provider={props.highlight}
      selectedLabels={labels.labels}
      dispatchLabels={dispatchLabels}
      onOpenChange={onOpenChange}
    />
  )
}
