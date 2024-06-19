import { LayoutType } from '../../homeFeed/HomeFeedContainer'
import { UserBasicData } from '../../../../lib/networking/queries/useGetViewerQuery'
import { DiscoverGridCard } from './DiscoverItemGridCard'
import { DiscoverItemListCard } from './DiscoverItemListCard'
import { SaveDiscoverArticleOutput } from "../../../../lib/networking/mutations/saveDiscoverArticle"
import { deleteDiscoverArticleMutation } from "../../../../lib/networking/mutations/deleteDiscoverArticle"
import { hideDiscoverArticleMutation } from "../../../../lib/networking/mutations/hideDiscoverArticle"
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
  hideDiscoverItem: (item: DiscoverFeedItem, setHidden: boolean) => Promise<void>,
  savedId?: string,
  setSavedId: (id: string | undefined) => void
  savedUrl?: string,
  setSavedUrl: (id: string | undefined) => void
  hidden?: boolean
  setArticleHidden?: (hidden: boolean) => void
}



export function DiscoverItemCard(props: DiscoverItemCardProps): JSX.Element {
  const [savedId, setSavedId] = useState(props.item.savedId)
  const [savedUrl, setSavedUrl] = useState(props.item.savedLinkUrl)
  const [hidden, setArticleHidden] = useState(props.item.hidden)
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

  const hideDiscoverItem = (item: DiscoverFeedItem, setHidden: boolean) : Promise<void> => {
    return hideDiscoverArticleMutation({ discoverArticleId: item.id, setHidden })
      .then(it => {
        if (it?.hideDiscoverArticle.id) {
          showSuccessToast(`Discover Article ${setHidden ? 'Hidden' : 'Unhidden'}`, { position: 'bottom-right' })
          setArticleHidden(setHidden)
        } else {
          showErrorToast('Unable to hide Article', { position: 'bottom-right' })
        }
      })
  }

  if (props.layout == 'LIST_LAYOUT') {
    return <DiscoverItemListCard {...{...props, savedId, savedUrl, setSavedId, setSavedUrl, deleteDiscoverItem, hideDiscoverItem, hidden, setArticleHidden}} />
  } else {
    return <DiscoverGridCard  {...{...props, savedId, savedUrl, setSavedId, setSavedUrl, deleteDiscoverItem, hideDiscoverItem, hidden, setArticleHidden}} />
  }
}
