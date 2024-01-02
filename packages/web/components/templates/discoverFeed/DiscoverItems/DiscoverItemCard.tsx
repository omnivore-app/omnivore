import { LayoutType } from '../../homeFeed/HomeFeedContainer'
import { UserBasicData } from '../../../../lib/networking/queries/useGetViewerQuery'
import { DiscoverGridCard } from './DiscoverItemGridCard'
import { DiscoverItemListCard } from './DiscoverItemListCard'
import { DiscoverItem } from '../../../../lib/networking/queries/useGetDiscoverItems'
import { SaveDiscoverArticleOutput } from "../../../../lib/networking/mutations/saveDiscoverArticle"
import { deleteDiscoverArticleMutation } from "../../../../lib/networking/mutations/deleteDiscoverArticle"
import { showErrorToast, showSuccessToast } from "../../../../lib/toastHelpers"
import { useState } from "react"

export type DiscoverItemCardProps = {
  item: DiscoverItem
  layout: LayoutType
  viewer?: UserBasicData
  isHovered?: boolean
  handleLinkSubmission: (
    link: string,
    timezone: string,
    locale: string
  ) => Promise<SaveDiscoverArticleOutput | undefined>
}

export type DiscoverItemSubCardProps = DiscoverItemCardProps & {
  deleteDiscoverItem: (item: DiscoverItem) => Promise<void>,
  savedId?: string,
  setSavedId: (id: string | undefined) => void
  savedUrl?: string,
  setSavedUrl: (id: string | undefined) => void
}



export function DiscoverItemCard(props: DiscoverItemCardProps): JSX.Element {
  const [savedId, setSavedId] = useState(props.item.savedId)
  const [savedUrl, setSavedUrl] = useState(props.item.savedLinkUrl)
  const deleteDiscoverItem = (item: DiscoverItem) : Promise<void> => {
    return deleteDiscoverArticleMutation({ discoverArticleId: item.id })
      .then(it => {

        console.log(it);
        if (it?.deleteDiscoverArticle.id) {
          showSuccessToast('Article deleted', { position: 'bottom-right' })
          setSavedId(undefined)
          setSavedUrl(undefined)
        } else {
          showErrorToast('Unable to delete Article', { position: 'bottom-right' })
        }
      })
  }

  if (props.layout == 'LIST_LAYOUT') {
    return <DiscoverItemListCard {...{...props, savedId, savedUrl, setSavedId, setSavedUrl, deleteDiscoverItem}} />
  } else {
    return <DiscoverGridCard  {...{...props, savedId, savedUrl, setSavedId, setSavedUrl, deleteDiscoverItem}} />
  }
}
