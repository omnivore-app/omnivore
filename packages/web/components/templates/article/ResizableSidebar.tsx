import SlidingPane from 'react-sliding-pane'
import { Resizable, ResizeCallback } from 're-resizable'
import useGetWindowDimensions from '../../../lib/hooks/useGetWindowDimensions'

type ResizableSidebarProps = {
  isShow: boolean
  onClose: () => void
  children: React.ReactNode
}

export function ResizableSidebar(props: ResizableSidebarProps): JSX.Element {
  const windowDimensions = useGetWindowDimensions()

  const handleResize: ResizeCallback = (_e, _direction, ref) => {
    if (parseInt(ref.style.width) < 210) {
      props.onClose()
    }
  }

  return (
    <SlidingPane
      className="sliding-pane-class"
      isOpen={props.isShow}
      width="fit-content"
      hideHeader={true}
      from="right"
      overlayClassName="slide-panel-overlay"
      onRequestClose={props.onClose}
    >
      <Resizable
        onResize={handleResize}
        defaultSize={{
          width: windowDimensions.width < 600 ? '100%' : '420px',
          height: '100%',
        }}
        enable={
          windowDimensions.width < 600
            ? false
            : {
                top: false,
                right: false,
                bottom: false,
                left: true,
                topRight: false,
                bottomRight: false,
                bottomLeft: false,
                topLeft: false,
              }
        }
      >
        {props.children}
      </Resizable>
    </SlidingPane>
  )
}
