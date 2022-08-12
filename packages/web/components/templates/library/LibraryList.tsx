import { Box } from '../../elements/LayoutPrimitives'
import { useGetViewerQuery } from '../../../lib/networking/queries/useGetViewerQuery'
import { useGetUserPreferences } from '../../../lib/networking/queries/useGetUserPreferences'
import { useMemo, useState } from 'react'
import { useGetLibraryItemsQuery } from '../../../lib/networking/queries/useGetLibraryItemsQuery'
import { LinkedItemCardAction } from '../../patterns/LibraryCards/CardTypes'
import { LibraryGridCard } from '../../patterns/LibraryCards/LibraryGridCard'

export type LayoutType = 'LIST_LAYOUT' | 'GRID_LAYOUT'


export function LibraryList(): JSX.Element {
  useGetUserPreferences()

  const [layout, setLayout] = useState<LayoutType>('GRID_LAYOUT')
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

  return (
    <Box css={{ overflowY: 'scroll' }}>
    {/* // {!isValidating && items.length == 0 ? (
    //   <EmptyLibrary
    //     onAddLinkClicked={() => {
          
    //     }}
    //   />
    // ) : ( */}
      <Box
        css={{
          display: 'grid',
          gridGap: layout == 'LIST_LAYOUT' ? '0' : '16px',
          width: '100%',
          gridAutoRows: 'auto',
          borderRadius: '8px',
          marginBottom: '0px',
          paddingRight: '14px',
          paddingTop: '0px',
          marginTop: layout == 'LIST_LAYOUT' ? '21px' : '0',
          paddingBottom: layout == 'LIST_LAYOUT' ? '0px' : '21px',
          '@smDown': {
            border: 'unset',
            width: layout == 'LIST_LAYOUT' ? '100vw' : undefined,
            margin: layout == 'LIST_LAYOUT' ? '16px -16px' : undefined,
            borderRadius: layout == 'LIST_LAYOUT' ? 0 : undefined,
          },
          '@lg': {
            gridTemplateColumns:
            layout == 'LIST_LAYOUT' ? 'none' : '1fr 1fr',
          },
          '@xl': {
            gridTemplateColumns:
              layout == 'LIST_LAYOUT' ? 'none' : 'repeat(3, 1fr)',
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
                layout={layout}
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