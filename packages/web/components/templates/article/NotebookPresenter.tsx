import { ReadableItem } from '../../../lib/networking/queries/useGetLibraryItemsQuery'
import { UserBasicData } from '../../../lib/networking/queries/useGetViewerQuery'
import SlidingPane from 'react-sliding-pane'
import 'react-sliding-pane/dist/react-sliding-pane.css'
import { NotebookView } from '../inspectors/NotebookView'
import { NotebookHeader } from './NotebookHeader'
import useGetWindowDimensions from '../../../lib/hooks/useGetWindowDimensions'
import { useRouter } from 'next/router'
import { showErrorToast } from '../../../lib/toastHelpers'

type NotebookPresenterProps = {
  viewer: UserBasicData

  item: ReadableItem

  open: boolean
  setOpen: (open: boolean) => void
}

export const NotebookPresenter = (props: NotebookPresenterProps) => {
  const windowDimensions = useGetWindowDimensions()
  const router = useRouter()

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
        <NotebookHeader
          viewer={props.viewer}
          item={props.item}
          setShowNotebook={props.setOpen}
        />
        <NotebookView
          viewer={props.viewer}
          item={props.item}
          viewInReader={(highlightId) => {
            if (!router || !router.isReady || !props.viewer) {
              showErrorToast('Error navigating to highlight')
              return
            }
            router.push(
              {
                pathname: '/[username]/[slug]',
                query: {
                  username: props.viewer.profile.username,
                  slug: props.item.slug,
                },
                hash: highlightId,
              },
              `/${props.viewer.profile.username}/${props.item.slug}#${highlightId}`,
              {
                scroll: false,
              }
            )
          }}
        />
      </>
    </SlidingPane>
  )
}
