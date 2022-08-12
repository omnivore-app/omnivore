import { Box, HStack, SpanBox, VStack } from './../../elements/LayoutPrimitives'
import { useGetViewerQuery } from '../../../lib/networking/queries/useGetViewerQuery'
import { useGetUserPreferences } from '../../../lib/networking/queries/useGetUserPreferences'
import { LibraryMenu } from './LibraryMenu'
import { LibraryAvatar } from './LibraryAvatar'
import { LibrarySearchBar } from './LibrarySearchBar'
import { LibraryList } from './LibraryList'
import { LibraryHeadline } from './LibraryHeadline'


export function LibraryContainer(): JSX.Element {
  useGetUserPreferences()

  const { viewerData } = useGetViewerQuery()

  return (
    <>
      <VStack alignment="start" distribution="start" css={{ width: '100vw', height: '100vh', overflow: 'hidden', bg: '$libraryBackground' }}>
        <HStack alignment="start" distribution="start" css={{ width: '100%' }}>
          <LibrarySearchBar />
          <SpanBox css={{ marginLeft: 'auto', width: '130px', height: '100%' }}>
            <LibraryAvatar viewer={viewerData?.me} />
          </SpanBox>
        </HStack>
        <HStack alignment="start" distribution="start" css={{ width: '100%', height: '100%' }}>
          <LibraryMenu />
          <VStack alignment="start" distribution="start" css={{ width: '100%', height: '100%', mr: '20px' }}>
            <LibraryHeadline />
            <LibraryList />
          </VStack>
        </HStack>
      </VStack>
    </>
  )
}