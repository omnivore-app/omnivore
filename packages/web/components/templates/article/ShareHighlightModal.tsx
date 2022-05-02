import { Highlight } from '../../../lib/networking/fragments/highlightFragment'
import { HighlightView } from '../../patterns/HighlightView'
import { ShareModalLayout } from './ShareModal'

type ShareHighlightModalProps = {
  highlight: Highlight
  url: string
  title: string
  author?: string
  description?: string
  onOpenChange: (open: boolean) => void
}

export function ShareHighlightModal(
  props: ShareHighlightModalProps
): JSX.Element {
  return (
    <ShareModalLayout
      url={props.url}
      type='highlight'
      modalTitle={`Share Highlight ${props.highlight?.annotation ? '& Note' : ''}`}
      title={props.title}
      description={props.description}
      onOpenChange={props.onOpenChange}
    >
      <HighlightView
        title={props.title}
        author={props.author}
        highlight={props.highlight}
      />
    </ShareModalLayout>    
  )
}
