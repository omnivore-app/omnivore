import { LayoutType } from '../../homeFeed/HomeFeedContainer'
import { UserBasicData } from '../../../../lib/networking/queries/useGetViewerQuery'
import { DiscoverGridCard } from './DiscoverItemGridCard'
import { DiscoverItemListCard } from './DiscoverItemListCard'
import { SaveDiscoverArticleOutput } from "../../../../lib/networking/mutations/saveDiscoverArticle"
import { deleteDiscoverArticleMutation } from "../../../../lib/networking/mutations/deleteDiscoverArticle"
import { showErrorToast, showSuccessToast } from "../../../../lib/toastHelpers"
import { useState } from "react"
import { DiscoverFeedItem } from "../../../../lib/networking/queries/useGetDiscoverFeedItems"

export type DiscoverItemCardProps = {
  item: DiscoverFeedItem
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
  deleteDiscoverItem: (item: DiscoverFeedItem) => Promise<void>,
  savedId?: string,
  setSavedId: (id: string | undefined) => void
  savedUrl?: string,
  setSavedUrl: (id: string | undefined) => void
}



export function DiscoverItemCard(props: DiscoverItemCardProps): JSX.Element {
  const [savedId, setSavedId] = useState(props.item.savedId)
  const [savedUrl, setSavedUrl] = useState(props.item.savedLinkUrl)
  const deleteDiscoverItem = (item: DiscoverFeedItem) : Promise<void> => {
    return deleteDiscoverArticleMutation({ discoverArticleId: item.id })
      .then(it => {
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
