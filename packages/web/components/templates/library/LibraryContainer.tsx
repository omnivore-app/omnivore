import { HStack, SpanBox, VStack } from './../../elements/LayoutPrimitives'
import { useGetViewerQuery } from '../../../lib/networking/queries/useGetViewerQuery'
import { useGetUserPreferences } from '../../../lib/networking/queries/useGetUserPreferences'
import { LibraryMenu } from './LibraryMenu'
import { LibraryAvatar } from './LibraryAvatar'
import { LibrarySearchBar } from './LibrarySearchBar'
import { LibraryList } from './LibraryList'
import { LibraryHeadline } from './LibraryHeadline'
import { useCallback, useState } from 'react'
import { LibraryItemsQueryInput } from '../../../lib/networking/queries/useGetLibraryItemsQuery'
import { usePersistedState } from '../../../lib/hooks/usePersistedState'

export type SearchCoordinator = {
  applySearch: (searchTerm: string) => void
}

const useSearchCoordinator = () => {
  const applySearch = useCallback((searchTerm: string) => {
    console.log('applying search')
  }, [])

  return {
    applySearch,
  }
}

export type LibraryLayoutType = 'LIST_LAYOUT' | 'GRID_LAYOUT'

export type LayoutCoordinator = {
  layout: LibraryLayoutType
  setLayout: (type: LibraryLayoutType) => void
}

const useLibraryLayoutCoordinator = () => {
  const [layout, setLayout] = usePersistedState<LibraryLayoutType>({
    key: 'libraryLayout',
    initialValue: 'GRID_LAYOUT',
  })

  return {
    layout,
    setLayout,
  }
}

export function LibraryContainer(): JSX.Element {
  useGetUserPreferences()

  const { viewerData } = useGetViewerQuery()
  const searchCoordinator = useSearchCoordinator()
  const layoutCoordinator = useLibraryLayoutCoordinator()

  return (
    <>
      <VStack
        alignment="start"
        distribution="start"
        css={{
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
          bg: '$libraryBackground',
        }}
      >
        <HStack alignment="start" distribution="start" css={{ width: '100%' }}>
          <SpanBox css={{ width: '100%', height: '90px' }}>
            <LibrarySearchBar coordinator={searchCoordinator} />
          </SpanBox>
          <SpanBox css={{ marginLeft: 'auto', width: '130px', height: '100%' }}>
            <LibraryAvatar viewer={viewerData?.me} />
          </SpanBox>
        </HStack>
        <HStack
          alignment="start"
          distribution="start"
          css={{ width: '100%', height: '100%' }}
        >
          <LibraryMenu />
          <VStack
            alignment="start"
            distribution="start"
            css={{ width: '100%', height: '100%', mr: '20px' }}
          >
            <LibraryHeadline layoutCoordinator={layoutCoordinator} />
            <LibraryList layoutCoordinator={layoutCoordinator} />
          </VStack>
        </HStack>
      </VStack>
    </>
  )
}
