import { Box } from '../../../elements/LayoutPrimitives'
import { UserBasicData } from '../../../../lib/networking/queries/useGetViewerQuery'
import { LayoutType } from '../../homeFeed/HomeFeedContainer'
import { DiscoverItemCard } from './DiscoverItemCard'
import { SaveDiscoverArticleOutput } from "../../../../lib/networking/mutations/saveDiscoverArticle"
import { DiscoverFeedItem } from "../../../../lib/networking/queries/useGetDiscoverFeedItems"

type DiscoverItemsProps = {
  items: DiscoverFeedItem[]
  layout: LayoutType
  viewer?: UserBasicData
  handleLinkSubmission: (
    link: string,
    timezone: string,
    locale: string
  ) => Promise<SaveDiscoverArticleOutput | undefined>
}

export function DiscoverItems(props: DiscoverItemsProps): JSX.Element {
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
        marginTop: '10px',
        marginBottom: '0px',
        paddingTop: '0',
        paddingBottom: '0px',
        '@media (max-width: 930px)': {
          gridGap: props.layout == 'LIST_LAYOUT' ? '0px' : '20px',
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
        '@media (min-width: 930px)': {
          gridTemplateColumns:
            props.layout == 'LIST_LAYOUT' ? 'none' : 'repeat(2, 1fr)',
        },
        '@media (min-width: 1280px)': {
          gridTemplateColumns:
            props.layout == 'LIST_LAYOUT' ? 'none' : 'repeat(3, 1fr)',
        },
        '@media (min-width: 1600px)': {
          gridTemplateColumns:
            props.layout == 'LIST_LAYOUT' ? 'none' : 'repeat(4, 1fr)',
        },
      }}
    >
      {props.items.map((linkedItem) => (
        <Box
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
            layout={props.layout}
            item={linkedItem}
            handleLinkSubmission={props.handleLinkSubmission}
            viewer={props.viewer}
          />
        </Box>
      ))}
    </Box>
  )
}
