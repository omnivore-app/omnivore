import { useMemo, useState } from 'react'
import { styled } from '@stitches/react'
import Masonry from 'react-masonry-css'
import Dropzone from 'react-dropzone'
import * as Progress from '@radix-ui/react-progress'
import axios from 'axios'

import { StyledText } from '../../elements/StyledText'
import { theme } from '../../tokens/stitches.config'

import { Box } from '../../elements/LayoutPrimitives'
import { useGetViewerQuery } from '../../../lib/networking/queries/useGetViewerQuery'
import { useGetUserPreferences } from '../../../lib/networking/queries/useGetUserPreferences'
import { useGetLibraryItemsQuery } from '../../../lib/networking/queries/useGetLibraryItemsQuery'
import { uploadFileRequestMutation } from '../../../lib/networking/mutations/uploadFileMutation'
import { LinkedItemCardAction } from '../../patterns/LibraryCards/CardTypes'
import { LibraryGridCard } from '../../patterns/LibraryCards/LibraryGridCard'
import { LayoutCoordinator } from './LibraryContainer'
import { EmptyLibrary } from '../homeFeed/EmptyLibrary'

//Styles
const DragnDropContainer = styled('div', {
  //width: '85%',
  height: '80%',
  position: 'absolute',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: '1',
  alignSelf: 'center',
  right: '20px',
  left: '270px',
})

const DragnDropStyle = styled('div', {
  border: '3px dashed gray',
  backgroundColor: 'aliceblue',
  borderRadius: '5px',
  width: '100%',
  height: '100%',
  opacity: '0.9',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  alignSelf: 'center',
  margin: '16px',
})

export type LibraryListProps = {
  layoutCoordinator: LayoutCoordinator
  reloadItems: () => void
}

export function LibraryList(props: LibraryListProps): JSX.Element {
  useGetUserPreferences()

  const { viewerData } = useGetViewerQuery()

  const defaultQuery = {
    limit: 50,
    sortDescending: true,
    searchQuery: undefined,
  }

  const {
    itemsPages,
    size,
    setSize,
    isValidating,
    performActionOnItem,
    mutate,
  } = useGetLibraryItemsQuery(defaultQuery)

  const [uploadingFiles, setUploadingFiles] = useState([])
  const [inDragOperation, setInDragOperation] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleDrop = async (acceptedFiles: any) => {
    setInDragOperation(false)
    setUploadingFiles(acceptedFiles.map((file: { name: any }) => file.name))

    for (const file of acceptedFiles) {
      try {
        const request = await uploadFileRequestMutation({
          // This will tell the backend not to save the URL
          // and give it the local filename as the title.
          url: `file://local/${file.path}`,
          contentType: file.type,
          createPageEntry: true,
        })
        if (!request?.uploadSignedUrl) {
          throw 'No upload URL available'
        }

        const uploadResult = await axios.request({
          method: 'PUT',
          url: request?.uploadSignedUrl,
          data: file,
          withCredentials: false,
          headers: {
            'Content-Type': 'application/pdf',
          },
          onUploadProgress: (p) => {
            if (!p.total) {
              console.warn('No total available for upload progress')
              return
            }
            const progress = (p.loaded / p.total) * 100
            console.log('upload progress: ', progress)
            setUploadProgress(progress)
          },
        })

        console.log('result of uploading: ', uploadResult)
      } catch (error) {
        console.log('ERROR', error)
      }
    }

    setUploadingFiles([])
    //props.reloadItems()
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

  return (
    <Box css={{ overflow: 'scroll' }}>
      <Dropzone
        onDrop={handleDrop}
        onDragEnter={() => {
          setInDragOperation(true)
        }}
        onDragLeave={() => {
          setInDragOperation(false)
        }}
        preventDropOnDocument={true}
        noClick={true}
        accept={{
          'application/pdf': ['.pdf'],
        }}
      >
        {({ getRootProps, getInputProps }) => (
          <div
            {...getRootProps({ className: 'dropzone' })}
            style={{ width: '100%', height: '100%' }}
          >
            {inDragOperation && uploadingFiles.length < 1 && (
              <DragnDropContainer>
                <DragnDropStyle>
                  <Box
                    css={{
                      color: '$utilityTextDefault',
                      fontWeight: '800',
                      fontSize: '$4',
                    }}
                  >
                    Drop PDF document to upload and add to your library
                  </Box>
                </DragnDropStyle>
              </DragnDropContainer>
            )}
            {uploadingFiles.length > 0 && (
              <DragnDropContainer>
                <DragnDropStyle>
                  <Box
                    css={{
                      color: '$utilityTextDefault',
                      fontWeight: '800',
                      fontSize: '$4',
                      width: '80%',
                    }}
                  >
                    <Progress.Root
                      className="ProgressRoot"
                      value={uploadProgress}
                    >
                      <Progress.Indicator
                        className="ProgressIndicator"
                        style={{
                          transform: `translateX(-${100 - uploadProgress}%)`,
                        }}
                      />
                    </Progress.Root>
                    <StyledText
                      style="boldText"
                      css={{
                        color: theme.colors.omnivoreGray.toString(),
                      }}
                    >
                      Uploading file
                    </StyledText>
                  </Box>
                </DragnDropStyle>
              </DragnDropContainer>
            )}
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
      {/* Extra padding at bottom to give space for scrolling */}
      <Box css={{ width: '100%', height: '200px' }} />
    </Box>
  )
}
