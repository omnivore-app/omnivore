import { Box } from '../../elements/LayoutPrimitives'
import { useGetViewerQuery } from '../../../lib/networking/queries/useGetViewerQuery'
import { useGetUserPreferences } from '../../../lib/networking/queries/useGetUserPreferences'
import { useMemo } from 'react'
import { useGetLibraryItemsQuery } from '../../../lib/networking/queries/useGetLibraryItemsQuery'
import { LinkedItemCardAction } from '../../patterns/LibraryCards/CardTypes'
import { LibraryGridCard } from '../../patterns/LibraryCards/LibraryGridCard'
import { LayoutCoordinator } from './LibraryContainer'
import { EmptyLibrary } from '../homeFeed/EmptyLibrary'

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
          
        }}
      />
    )
  }

  return (
    <Box css={{ overflowY: 'scroll' }}>
      <Box
        css={{
          width: '100%',

          display: 'grid',
          gridAutoRows: 'auto',
          borderRadius: '8px',
          marginBottom: '0px',
          paddingRight: '14px',
          paddingTop: '0px',
          marginTop: '0px',
          paddingBottom: '21px',
          '@smDown': {
            border: 'unset',
            width: props.layoutCoordinator.layout == 'LIST_LAYOUT' ? '100vw' : undefined,
            margin: props.layoutCoordinator.layout == 'LIST_LAYOUT' ? '16px -16px' : undefined,
            borderRadius: props.layoutCoordinator.layout == 'LIST_LAYOUT' ? 0 : undefined,
          },
          '@lg': {
            gridTemplateColumns:
            props.layoutCoordinator.layout == 'LIST_LAYOUT' ? 'none' : '1fr 1fr',
          },
          '@xl': {
            gridTemplateColumns:
            props.layoutCoordinator.layout == 'LIST_LAYOUT' ? 'none' : 'repeat(3, 1fr)',
          },
        }}
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
                layout={props.layoutCoordinator.layout}
                item={linkedItem.node}
                viewer={viewerData.me}
                handleAction={(action: LinkedItemCardAction) => {
                  console.log('card clicked')
                }}
              />
            )}
          </Box>
        ))}
      </Box>
        {/* Extra padding at bottom to give space for scrolling */}
        <Box css={{ width: '100%', height: '200px' }} />
      </Box>
  )
}