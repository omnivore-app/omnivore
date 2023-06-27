import { Highlight } from '../../../lib/networking/fragments/highlightFragment'
import { ReadableItem } from '../../../lib/networking/queries/useGetLibraryItemsQuery'
import {
  UserBasicData,
  useGetViewerQuery,
} from '../../../lib/networking/queries/useGetViewerQuery'
import SlidingPane from 'react-sliding-pane'
import 'react-sliding-pane/dist/react-sliding-pane.css'
import { NotebookContent } from './Notebook'
import { NotebookHeader } from './NotebookHeader'
import useGetWindowDimensions from '../../../lib/hooks/useGetWindowDimensions'

type NotebookPresenterProps = {
  viewer: UserBasicData

  item: ReadableItem

  open: boolean
  setOpen: (open: boolean) => void
}

export const NotebookPresenter = (props: NotebookPresenterProps) => {
  const windowDimensions = useGetWindowDimensions()

  return (
    <SlidingPane
      className="sliding-pane-class"
      isOpen={props.open}
      width={windowDimensions.width < 600 ? '100%' : '420px'}
      hideHeader={true}
      from="right"
      overlayClassName="slide-panel-overlay"
      onRequestClose={() => {
        props.setOpen(false)
      }}
    >
      <>
        <NotebookHeader setShowNotebook={props.setOpen} />
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
      </>
    </SlidingPane>
  )
}
