import { useMemo, useState } from 'react'
import Dropzone from 'react-dropzone'
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
  const [inDragOperation, setInDragOperation] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState([])

  const handleDrop = (acceptedFiles: any) => {
    setFileNames(acceptedFiles.map((file: { name: any }) => file.name))
    setUploadingFiles(acceptedFiles.map((file: { name: any }) => file.name))
  }

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
      {inDragOperation && uploadingFiles.length < 1 && (
        <Box
          css={{
            border: '3px dashed gray',
            backgroundColor: 'aliceblue',
            borderRadius: '5px',
            width: '75%',
            height: '70%',
            position: 'absolute',
            opacity: '0.8',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Box
            css={{
              color: '$utilityTextDefault',
              fontWeight: '800',
              fontSize: '$4',
            }}
          >
            Drag n drop files here
          </Box>
        </Box>
      )}
      <Dropzone
        onDrop={handleDrop}
        preventDropOnDocument={true}
        onDragEnter={() => {
          setInDragOperation(true)
        }}
        onDragLeave={() => {
          setInDragOperation(false)
        }}
        noClick={true}
        noDragEventsBubbling={true}
      >
        {({ getRootProps, getInputProps, acceptedFiles, fileRejections }) => (
          <Box
            {...getRootProps({ className: 'dropzone' })}
            css={{ width: '100%' }}
          >
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
          </Box>
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
      </div>{' '}
      {/* Temporary code */}
      {/* Extra padding at bottom to give space for scrolling */}
      <Box css={{ width: '100%', height: '200px' }} />
    </Box>
  )
}
