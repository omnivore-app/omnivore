import { Box } from '../../../elements/LayoutPrimitives'
import { UserBasicData } from '../../../../lib/networking/queries/useGetViewerQuery'
import { LayoutType } from '../../homeFeed/HomeFeedContainer'
import { DiscoveryItemCard } from './DiscoveryItemCard'
import { DiscoveryItem } from '../../../../lib/networking/queries/useGetDiscoveryItems'
import { SaveDiscoveryArticleOutput } from "../../../../lib/networking/mutations/saveDiscoverArticle"
import { useFetchMore } from "../../../../lib/hooks/useFetchMoreScroll"

type DiscoveryItemsProps = {
  items: DiscoveryItem[]
  layout: LayoutType
  viewer?: UserBasicData
  handleLinkSubmission: (
    link: string,
    timezone: string,
    locale: string
  ) => Promise<SaveDiscoveryArticleOutput | undefined>
}

export function DiscoveryItems(props: DiscoveryItemsProps): JSX.Element {
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
        overflow: 'hidden',
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
          className="linkedItemCard"
          data-testid="linkedItemCard"
          id={linkedItem.id}
          tabIndex={0}
          key={linkedItem.id + linkedItem.image}
          css={{
            width: '100%',
            '&:focus-visible': {
              outline: 'none',
            },
            '&> div': {
              bg: '$thBackground3',
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
              },
              '> a': {
                bg: '$thBackgroundActive',
              },
            },
          }}
        >
          <DiscoveryItemCard
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
