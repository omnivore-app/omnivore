import { Highlight } from '../../../lib/networking/fragments/highlightFragment'
import { ReadableItem } from '../../../lib/networking/queries/useGetLibraryItemsQuery'
import {
  UserBasicData,
  useGetViewerQuery,
} from '../../../lib/networking/queries/useGetViewerQuery'
import { NotebookModal } from './NotebookModal'

type NotebookPresenterProps = {
  viewer: UserBasicData

  item: ReadableItem

  onClose: (highlights: Highlight[]) => void
}

export const NotebookPresenter = (props: NotebookPresenterProps) => {
  return (
    <NotebookModal
      viewer={props.viewer}
      item={props.item}
      onClose={(highlights: Highlight[]) => {
        console.log('NotebookModal: ', highlights)
        props.onClose(highlights)
      }}
      viewHighlightInReader={(highlightId) => {
        window.location.href = `/${props.viewer.profile.username}/${props.item.slug}#${highlightId}`
      }}
    />
  )
}
