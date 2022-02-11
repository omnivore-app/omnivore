import { ShareModalLayout } from './ShareModal'
import { ShareArticleView } from '../../patterns/ShareArticleView'

type ShareArticleModalProps = {
  url: string
  title: string
  imageURL?: string
  author?: string
  site?: string
  description?: string
  publishedAt: string
  originalArticleUrl: string
  onOpenChange: (open: boolean) => void
}

export function ShareArticleModal(
  props: ShareArticleModalProps
): JSX.Element {
  return (
    <ShareModalLayout
      url={props.url}
      type='link'
      modalTitle='Share Article'
      title={props.title}
      description={props.description}
      onOpenChange={props.onOpenChange}
    >
      <ShareArticleView
        url={props.url}
        title={props.title}
        imageURL={props.imageURL}
        author={props.author}
        publishedAt={props.publishedAt}
        originalArticleUrl={props.originalArticleUrl}
        description={props.description}
      />
    </ShareModalLayout>      
  )
}
