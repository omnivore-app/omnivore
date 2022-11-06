import { SetStateAction, useMemo, useState } from 'react'
import Dropzone, { useDropzone } from 'react-dropzone'
import { Box } from '../../elements/LayoutPrimitives'
import { useGetViewerQuery } from '../../../lib/networking/queries/useGetViewerQuery'
import { useGetUserPreferences } from '../../../lib/networking/queries/useGetUserPreferences'
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

  const [fileNames, setFileNames] = useState([])

  const handleDrop = (acceptedFiles) =>
    setFileNames(acceptedFiles.map((file: { name: any }) => file.name))

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
  console.log(fileNames)

  return (
    <Box css={{ overflowY: 'scroll' }}>
      <Dropzone onDrop={handleDrop} preventDropOnDocument={true} noClick={true}>
        {({ getRootProps, getInputProps, acceptedFiles, fileRejections }) => (
          <div {...getRootProps({ className: 'dropzone' })}>
            <p>Drag n drop files, or click to select files</p>
            <input {...getInputProps()} />

            <Masonry
              breakpointCols={
                props.layoutCoordinator.layout == 'LIST_LAYOUT'
                  ? 1
                  : {
                      default: 3,
                      1200: 2,
                      992: 1,
                    }
              }
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
            </Masonry>
          </div>
        )}
      </Dropzone>

      {/* Temporary code */}
      <div>
        <strong>Files:</strong>
        <ul>
          {fileNames.map((fileName) => (
            <li key={fileName}>{fileName}</li>
          ))}
        </ul>
      </div>

      {/* Extra padding at bottom to give space for scrolling */}
      <Box css={{ width: '100%', height: '200px' }} />
    </Box>
  )
}
