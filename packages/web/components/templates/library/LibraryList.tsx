import { Box } from '../../elements/LayoutPrimitives'
import { useGetViewerQuery } from '../../../lib/networking/queries/useGetViewerQuery'
import { useGetUserPreferences } from '../../../lib/networking/queries/useGetUserPreferences'
import { useMemo } from 'react'
import { useGetLibraryItemsQuery } from '../../../lib/networking/queries/useGetLibraryItemsQuery'
import { LinkedItemCardAction } from '../../patterns/LibraryCards/CardTypes'
import { LibraryGridCard } from '../../patterns/LibraryCards/LibraryGridCard'
import { LayoutCoordinator } from './LibraryContainer'
import { EmptyLibrary } from '../homeFeed/EmptyLibrary'
import Masonry from 'react-masonry-css'


export type LibraryListProps = {
  layoutCoordinator: LayoutCoordinator
}

export function LibraryList(props: LibraryListProps): JSX.Element {
  useGetUserPreferences()

  const { viewerData } = useGetViewerQuery()

  const defaultQuery = {
    limit: 50,
    sortDescending: true,
    searchQuery: undefined,
  }

  const { itemsPages, size, setSize, isValidating, performActionOnItem } =
    useGetLibraryItemsQuery(defaultQuery)

  const libraryItems = useMemo(() => {
    const items =
      itemsPages?.flatMap((ad) => {
        return ad.search.edges
      }) || []
    return items
  }, [itemsPages, performActionOnItem])

  if (!isValidating && libraryItems.length == 0) {
    return (
      <EmptyLibrary
        onAddLinkClicked={() => {
          console.log('onAddLinkClicked')
        }}
      />
    )
  }

  return (
    <Box css={{ overflowY: 'scroll' }}>
      <Masonry
        breakpointCols={props.layoutCoordinator.layout == 'LIST_LAYOUT' ? 1 : {
          default: 3,
          1200: 2,
          992: 1
        }}
        className="omnivore-masonry-grid"
        columnClassName="omnivore-masonry-grid_column"
      >
        {libraryItems.map((linkedItem) => (
          <Box
            className="linkedItemCard"
            data-testid="linkedItemCard"
            id={linkedItem.node.id}
            tabIndex={0}
            key={linkedItem.node.id}
            css={{
              width: '100%',
              '&> div': {
                bg: '$libraryBackground',
              },
              '&:focus': {
                '> div': {
                  bg: '$grayBgActive',
                },
              },
              '&:hover': {
                '> div': {
                  bg: '$grayBgActive',
                },
              },
            }}
          >
            {viewerData?.me && (
              <LibraryGridCard
                //layout={props.layoutCoordinator.layout}
                layout={'LIST_LAYOUT'}
                item={linkedItem.node}
                viewer={viewerData.me}
                handleAction={(action: LinkedItemCardAction) => {
                  console.log('card clicked')
                }}
              />
            )}
          </Box>
        ))}
      </Masonry>
      {/* Extra padding at bottom to give space for scrolling */}
      <Box css={{ width: '100%', height: '200px' }} />
    </Box>
  )
}