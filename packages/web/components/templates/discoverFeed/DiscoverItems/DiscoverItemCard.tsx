import { LayoutType } from '../../homeFeed/HomeFeedContainer'
import { UserBasicData } from '../../../../lib/networking/queries/useGetViewerQuery'
import { DiscoverGridCard } from './DiscoverItemGridCard'
import { DiscoverItemListCard } from './DiscoverItemListCard'
import { SaveDiscoverArticleOutput } from "../../../../lib/networking/mutations/saveDiscoverArticle"
import { deleteDiscoverArticleMutation } from "../../../../lib/networking/mutations/deleteDiscoverArticle"
import { showErrorToast, showSuccessToast } from "../../../../lib/toastHelpers"
import { useState } from "react"
import { DiscoverFeedItem } from "../../../../lib/networking/queries/useGetDiscoverFeedItems"
import { DiscoverVisibilityType } from "../DiscoverContainer"
import { HideDiscoverArticleOutput } from '../../../../lib/networking/queries/useGetDiscoverFeeds'

export type DiscoverItemCardProps = {
  item: DiscoverFeedItem
  layout: LayoutType
  visibility: DiscoverVisibilityType
  viewer?: UserBasicData
  isHovered?: boolean
  hideDiscoverItem(item: DiscoverFeedItem, setHidden: boolean): Promise<HideDiscoverArticleOutput | undefined>
  handleLinkSubmission: (
    link: string,
    timezone: string,
    locale: string
  ) => Promise<SaveDiscoverArticleOutput | undefined>
}

export type DiscoverItemSubCardProps = DiscoverItemCardProps & {
  deleteDiscoverItem: (item: DiscoverFeedItem) => Promise<void>,
  setItemHidden: (item: DiscoverFeedItem, setHidden: boolean) => Promise<void>,
  savedId?: string,
  setSavedId: (id: string | undefined) => void
  savedUrl?: string,
  setSavedUrl: (id: string | undefined) => void
  hidden?: boolean
  setArticleHidden?: (hidden: boolean) => void
}



export function DiscoverItemCard(props: DiscoverItemCardProps): JSX.Element | null {
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

  const setHiddenDiscoverItem = (item: DiscoverFeedItem, setHidden: boolean) : Promise<void> => {
    return props.hideDiscoverItem(item, setHidden)
      .then(it => {
        if (it?.hideDiscoverArticle.id) {
          showSuccessToast(`Discover Article ${setHidden ? 'Hidden' : 'Unhidden'}`, { position: 'bottom-right' })
          setArticleHidden(setHidden)
        } else {
          showErrorToast('Unable to hide Article', { position: 'bottom-right' })
        }
      })
  }

  if (hidden && props.visibility == 'HIDE_HIDDEN') {
    return null;
  }

  if (props.layout == 'LIST_LAYOUT') {
    return <DiscoverItemListCard {...{...props, savedId, savedUrl, setSavedId, setSavedUrl, deleteDiscoverItem, setItemHidden: setHiddenDiscoverItem, hidden, setArticleHidden}} />
  } else {
    return <DiscoverGridCard  {...{...props, savedId, savedUrl, setSavedId, setSavedUrl, deleteDiscoverItem, setItemHidden: setHiddenDiscoverItem, hidden, setArticleHidden}} />
  }
}
