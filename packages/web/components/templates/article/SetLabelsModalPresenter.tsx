import { useCallback, useEffect } from 'react'
import { useSetPageLabels } from '../../../lib/hooks/useSetPageLabels'
import { LabelsProvider } from './SetLabelsControl'
import { SetLabelsModal } from './SetLabelsModal'
import { useSetHighlightLabels } from '../../../lib/hooks/useSetHighlightLabels'

type SetPageLabelsModalPresenterProps = {
  articleId: string
  article: LabelsProvider
  onOpenChange: (open: boolean) => void
}

export function SetPageLabelsModalPresenter(
  props: SetPageLabelsModalPresenterProps
): JSX.Element {
  const [labels, dispatchLabels] = useSetPageLabels(props.articleId)

  useEffect(() => {
    dispatchLabels({
      type: 'RESET',
      labels: props.article.labels ?? [],
    })
  }, [props.article, dispatchLabels])

  const onOpenChange = useCallback(() => {
    if (props.article) {
      props.article.labels = labels.labels
    }
    props.onOpenChange(true)
  }, [props, labels])

  return (
    <SetLabelsModal
      provider={props.article}
      selectedLabels={labels.labels}
      dispatchLabels={dispatchLabels}
      onOpenChange={onOpenChange}
    />
  )
}

type SetHighlightLabelsModalPresenterProps = {
  highlightId: string
  highlight: LabelsProvider
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

  return (
    <SetLabelsModal
      provider={props.highlight}
      selectedLabels={labels.labels}
      dispatchLabels={dispatchLabels}
      onOpenChange={props.onOpenChange}
    />
  )
}
