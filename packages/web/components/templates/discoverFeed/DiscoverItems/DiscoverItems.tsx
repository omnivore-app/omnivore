import { Box } from '../../../elements/LayoutPrimitives'
import { UserBasicData } from '../../../../lib/networking/queries/useGetViewerQuery'
import { LayoutType } from '../../homeFeed/HomeFeedContainer'
import { DiscoverItemCard } from './DiscoverItemCard'
import { SaveDiscoverArticleOutput } from "../../../../lib/networking/mutations/saveDiscoverArticle"
import { DiscoverFeedItem } from "../../../../lib/networking/queries/useGetDiscoverFeedItems"
import { DiscoverVisibilityType } from "../DiscoverContainer"
import { useEffect, useState } from "react"
import {
  HideDiscoverArticleInput,
  HideDiscoverArticleOutput
} from '../../../../lib/networking/queries/useGetDiscoverFeeds'

type DiscoverItemsProps = {
  items: DiscoverFeedItem[]
  layout: LayoutType
  visibility: DiscoverVisibilityType
  viewer?: UserBasicData
  handleLinkSubmission: (
    link: string,
    timezone: string,
    locale: string
  ) => Promise<SaveDiscoverArticleOutput | undefined>
  hideDiscoverArticle: (
    input: HideDiscoverArticleInput
  ) => Promise<HideDiscoverArticleOutput | undefined>
}

export function DiscoverItems(props: DiscoverItemsProps): JSX.Element {
  const [discoverItems, setDiscoveryItems] = useState(props.items);

  const hideDiscoverItem = (item: DiscoverFeedItem, setHidden: boolean) => {

    return props.hideDiscoverArticle({ discoverArticleId: item.id, setHidden});
  }

  useEffect(() => {
    setDiscoveryItems(props.items)
  }, [props.items])

  return (
    <Box
      id={"DiscoverItems"}
      css={{
        py: '$3',
        display: 'grid',
        width: '100%',
        gridAutoRows: 'auto',
        borderRadius: '6px',
        gridGap: props.layout == 'LIST_LAYOUT' ? '10px' : '20px',
        gridTemplateColumns: props.layout == 'LIST_LAYOUT' ? 'none' : 'repeat(auto-fill, minmax(280px, 1fr))',
        marginTop: '10px',
        marginBottom: '0px',
        paddingTop: '0',
        paddingBottom: '0px',
        '@media (max-width: 930px)': {
          gridGap: props.layout == 'LIST_LAYOUT' ? '0px' : '20px',
          paddingTop: '120px',
        },
        '@xlgDown': {
          borderRadius: props.layout == 'LIST_LAYOUT' ? 0 : undefined,
        },
        '@smDown': {
          border: 'unset',
          width: props.layout == 'LIST_LAYOUT' ? '100vw' : undefined,
          margin: props.layout == 'LIST_LAYOUT' ? '16px -16px' : undefined,
          borderRadius: props.layout == 'LIST_LAYOUT' ? 0 : undefined,
        },

      }}
    >
      {discoverItems.map((linkedItem) => {
        if (props.visibility == 'HIDE_HIDDEN' && linkedItem.hidden) {
          return null
        }

        return (<Box
          id={linkedItem.id}
          tabIndex={0}
          key={linkedItem.id + linkedItem.image}
          css={{
            width: '100%',
            '&:focus-visible': {
              outline: 'none',
            },
            '&> div': {
              bg: '$thLeftMenuBackground',
            },
            '&:focus': {
              outline: 'none',
              '> div': {
                outline: 'none',
                bg: '$thBackgroundActive',
              },
            },
            '&:hover': {
              '> div': {
                bg: '$thBackgroundActive',
                boxShadow: '$cardBoxShadow',
              },
              '> a': {
                bg: '$thBackgroundActive',
              },
            },
          }}
        >
          <DiscoverItemCard
            visibility={props.visibility}
            layout={props.layout}
            item={linkedItem}
            handleLinkSubmission={props.handleLinkSubmission}
            hideDiscoverItem={hideDiscoverItem}
            viewer={props.viewer}
          />
        </Box>)
      })}
    </Box>
  )
}
