import { LayoutType } from '../../homeFeed/HomeFeedContainer'
import { UserBasicData } from '../../../../lib/networking/queries/useGetViewerQuery'
import { DiscoveryGridCard } from './DiscoveryItemGridCard'
import { DiscoveryItemListCard } from './DiscoveryItemListCard'
import { DiscoveryItem } from '../../../../lib/networking/queries/useGetDiscoveryItems'
import { SaveDiscoveryArticleOutput } from "../../../../lib/networking/mutations/saveDiscoverArticle"
import { deleteDiscoverArticleMutation } from "../../../../lib/networking/mutations/deleteDiscoverArticle"
import { showErrorToast, showSuccessToast } from "../../../../lib/toastHelpers"
import { useState } from "react"

export type DiscoveryItemCardProps = {
  item: DiscoveryItem
  layout: LayoutType
  viewer?: UserBasicData
  isHovered?: boolean
  handleLinkSubmission: (
    link: string,
    timezone: string,
    locale: string
  ) => Promise<SaveDiscoveryArticleOutput | undefined>
}

export type DiscoveryItemSubCardProps = DiscoveryItemCardProps & {
  deleteDiscoveryItem: (item: DiscoveryItem) => Promise<void>,
  savedId?: string,
  setSavedId: (id: string | undefined) => void
  savedUrl?: string,
  setSavedUrl: (id: string | undefined) => void
}



export function DiscoveryItemCard(props: DiscoveryItemCardProps): JSX.Element {
  const [savedId, setSavedId] = useState(props.item.savedId)
  const [savedUrl, setSavedUrl] = useState(props.item.savedLinkUrl)
  const deleteDiscoveryItem = (item: DiscoveryItem) : Promise<void> => {
    return deleteDiscoverArticleMutation({ discoveryArticleId: item.id })
      .then(it => {

        console.log(it);
        if (it?.deleteDiscoveryArticle.id) {
          showSuccessToast('Article deleted', { position: 'bottom-right' })
          setSavedId(undefined)
          setSavedUrl(undefined)
        } else {
          showErrorToast('Unable to delete Article', { position: 'bottom-right' })
        }
      })
  }

  if (props.layout == 'LIST_LAYOUT') {
    return <DiscoveryItemListCard {...{...props, savedId, savedUrl, setSavedId, setSavedUrl, deleteDiscoveryItem}} />
  } else {
    return <DiscoveryGridCard  {...{...props, savedId, savedUrl, setSavedId, setSavedUrl, deleteDiscoveryItem}} />
  }
}
