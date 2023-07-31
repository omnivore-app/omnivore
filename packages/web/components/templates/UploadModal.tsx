import { useRef, useCallback, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Box, HStack, SpanBox, VStack } from '../elements/LayoutPrimitives'
import {
  ModalContent,
  ModalOverlay,
  ModalRoot,
  ModalTitleBar,
} from '../elements/ModalPrimitives'
import { styled } from '@stitches/react'
import Dropzone, { DropEvent, DropzoneRef, FileRejection } from 'react-dropzone'
import * as Progress from '@radix-ui/react-progress'
import { theme } from '../tokens/stitches.config'
import { uploadFileRequestMutation } from '../../lib/networking/mutations/uploadFileMutation'
import axios from 'axios'
import { File } from 'phosphor-react'
import { showErrorToast } from '../../lib/toastHelpers'
import {
  UploadImportFileType,
  uploadImportFileRequestMutation,
} from '../../lib/networking/mutations/uploadImportFileMutation'
import Papa from 'papaparse'

const DragnDropContainer = styled('div', {
  width: '100%',
  height: '80%',
  position: 'absolute',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: '1',
  alignSelf: 'center',
  left: 0,
  flexDirection: 'column',
  padding: '25px',
})

const DragnDropStyle = styled('div', {
  border: '1px solid $grayBorder',
  borderRadius: '5px',
  width: '100%',
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  alignSelf: 'center',
  color: '$thTextSubtle2',
  padding: '10px',
})

const DragnDropIndicator = styled('div', {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  alignSelf: 'center',
  width: '100%',
  height: '100%',
  borderRadius: '5px',
})

const ProgressIndicator = styled(Progress.Indicator, {
  backgroundColor: '$omnivoreCtaYellow',
  width: '100%',
  height: '100%',
})

const ProgressRoot = styled(Progress.Root, {
  position: 'relative',
  overflow: 'hidden',
  background: '$omnivoreGray',
  borderRadius: '99999px',
  width: '100%',
  height: '5px',
  transform: 'translateZ(0)',
})

type UploadModalProps = {
  onOpenChange: (open: boolean) => void
}

type UploadingFile = {
  id: string
  file: any
  name: string
  progress: number
  status: 'inprogress' | 'success' | 'error'
  openUrl: string | undefined
  contentType: string
  message?: string
}

type UploadInfo = {
  uploadSignedUrl?: string
  requestId?: string
  message?: string
}

export function UploadModal(props: UploadModalProps): JSX.Element {
  const [uploadFiles, setUploadFiles] = useState<UploadingFile[]>([
    // {
    //   id: uuidv4(),
    //   file: '',
    //   name: 'test file',
    //   status: 'inprogress',
    //   progress: (371712 / 864476) * 100,
    //   openUrl: '',
    // },
  ])
  const [inDragOperation, setInDragOperation] = useState(false)
  const dropzoneRef = useRef<DropzoneRef | null>(null)

  const openDialog = useCallback(
    (event) => {
      if (dropzoneRef.current) {
        dropzoneRef.current.open()
      }
      event?.preventDefault()
    },
    [dropzoneRef]
  )

  const uploadSignedUrlForFile = async (
    file: UploadingFile
  ): Promise<UploadInfo> => {
    switch (file.contentType) {
      case 'text/csv': {
        const { urlCount, invalidCount } = (await new Promise((resolve) => {
          let urlCount = 0
          let invalidCount = 0

          Papa.parse(file.file, {
            step: function (row, parser) {
              console.log('row: ', row)
              if (Array.isArray(row.data)) {
                try {
                  if (row.data[0].trim().length < 1) {
                    return
                  }

                  const url = new URL(row.data[0])
                  urlCount = urlCount + 1
                } catch (err) {
                  invalidCount = invalidCount + 1
                }
              }
            },
            complete: (results) => {
              resolve({ urlCount, invalidCount })
            },
          })
        })) as { urlCount: number; invalidCount: number }
        const result = await uploadImportFileRequestMutation(
          UploadImportFileType.URL_LIST,
          file.contentType
        )
        return {
          uploadSignedUrl: result?.uploadSignedUrl,
          message:
            invalidCount > 0
              ? `Importing ${urlCount} URLs (${invalidCount} invalid)`
              : `Importing ${urlCount} URLs`,
        }
      }
      case 'application/zip': {
        const result = await uploadImportFileRequestMutation(
          UploadImportFileType.MATTER,
          file.contentType
        )
        return {
          uploadSignedUrl: result?.uploadSignedUrl,
        }
      }
      case 'application/pdf':
      case 'application/epub+zip': {
        const request = await uploadFileRequestMutation({
          // This will tell the backend not to save the URL
          // and give it the local filename as the title.
          url: `file://local/${file.id}/${file.file.path}`,
          contentType: file.contentType,
          createPageEntry: true,
        })
        return {
          uploadSignedUrl: request?.uploadSignedUrl,
          requestId: request?.createdPageId,
        }
      }
    }
    return {}
  }

  const handleAcceptedFiles = useCallback(
    (acceptedFiles: any, event: DropEvent) => {
      setInDragOperation(false)

      const addedFiles = acceptedFiles.map(
        (file: { name: any; type: string }) => {
          return {
            id: uuidv4(),
            file: file,
            name: file.name,
            progress: 0,
            status: 'inprogress',
            contentType: file.type,
          }
        }
      )

      const allFiles = [...uploadFiles, ...addedFiles]

      setUploadFiles(allFiles)
      ;(async () => {
        for (const file of addedFiles) {
          try {
            console.log('using content type: ', file.file.type)
            const uploadInfo = await uploadSignedUrlForFile(file)
            if (!uploadInfo.uploadSignedUrl) {
              showErrorToast('No upload URL available')
              return
            }

            const uploadResult = await axios.request({
              method: 'PUT',
              url: uploadInfo.uploadSignedUrl,
              data: file.file,
              withCredentials: false,
              headers: {
                'Content-Type': file.file.type,
              },
              onUploadProgress: (p) => {
                if (!p.total) {
                  console.warn('No total available for upload progress')
                  return
                }
                const progress = (p.loaded / p.total) * 100
                file.progress = progress

                setUploadFiles([...allFiles])
              },
            })

            file.progress = 100
            file.status = 'success'
            file.openUrl = uploadInfo.requestId
              ? `/article/sr/${uploadInfo.requestId}`
              : undefined
            file.message = uploadInfo.message

            setUploadFiles([...allFiles])
          } catch (error) {
            file.status = 'error'
            setUploadFiles([...allFiles])
          }
        }
      })()
    },
    [uploadFiles]
  )

  return (
    <ModalRoot defaultOpen onOpenChange={props.onOpenChange}>
      <ModalOverlay />
      <ModalContent
        css={{
          bg: '$grayBg',
          px: '24px',
          minWidth: '650px',
          minHeight: '430px',
        }}
        onInteractOutside={() => {
          // remove focus from modal
          ;(document.activeElement as HTMLElement).blur()
        }}
      >
        <VStack distribution="start">
          <ModalTitleBar
            title="Upload File"
            onOpenChange={props.onOpenChange}
          />
          <Dropzone
            ref={dropzoneRef}
            onDragEnter={() => {
              setInDragOperation(true)
            }}
            onDragLeave={() => {
              setInDragOperation(false)
            }}
            onDropAccepted={handleAcceptedFiles}
            onDropRejected={(
              fileRejections: FileRejection[],
              event: DropEvent
            ) => {
              console.log('onDropRejected: ', fileRejections, event)
              alert('You can only upload PDF files to your Omnivore Library.')
              setInDragOperation(false)
              event.preventDefault()
            }}
            preventDropOnDocument={true}
            noClick={true}
            accept={{
              'text/csv': ['.csv'],
              'application/zip': ['.zip'],
              'application/pdf': ['.pdf'],
              'application/epub+zip': ['.epub'],
            }}
          >
            {({
              getRootProps,
              getInputProps,
              acceptedFiles,
              fileRejections,
            }) => (
              <div
                {...getRootProps({ className: 'dropzone' })}
                style={{ height: '100%', width: '100%' }}
              >
                <DragnDropContainer>
                  <DragnDropStyle>
                    <DragnDropIndicator
                      css={{
                        border: inDragOperation ? '2px dashed blue' : 'unset',
                      }}
                    >
                      <VStack alignment="center" css={{ gap: '10px' }}>
                        <File
                          size={48}
                          color={theme.colors.thTextSubtle2.toString()}
                        />
                        {inDragOperation ? (
                          <>
                            <Box
                              css={{
                                fontWeight: '800',
                                fontSize: '20px',
                              }}
                            >
                              Drop to upload your file
                            </Box>
                          </>
                        ) : (
                          <>
                            <Box
                              css={{
                                fontWeight: '800',
                                fontSize: '20px',
                              }}
                            >
                              Drag files here to add them to your library
                            </Box>
                            <Box
                              css={{
                                fontSize: '14px',
                              }}
                            >
                              Or{' '}
                              <a href="" onClick={openDialog}>
                                choose your files
                              </a>
                            </Box>
                          </>
                        )}
                      </VStack>
                    </DragnDropIndicator>
                  </DragnDropStyle>
                  <VStack css={{ width: '100%', mt: '25px', gap: '5px' }}>
                    {uploadFiles.map((file) => {
                      return (
                        <HStack
                          key={file.id}
                          css={{
                            width: '100%',
                            height: '54px',
                            border: '1px solid $grayBorder',
                            borderRadius: '5px',
                            padding: '15px',
                            gap: '10px',
                            color: '$thTextContrast',
                          }}
                          alignment="center"
                          distribution="start"
                        >
                          <Box
                            css={{
                              width: '280px',
                              maxLines: '1',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: '200px',
                              overflow: 'hidden',
                              fontSize: '14px',
                              fontWeight: 'bold',
                            }}
                          >
                            {file.name}
                          </Box>
                          {file.status != 'inprogress' ? (
                            <HStack
                              alignment="center"
                              css={{ marginLeft: 'auto', fontSize: '14px' }}
                            >
                              {file.status == 'success' && file.openUrl && (
                                <a href={file.openUrl}>Read Now</a>
                              )}
                              {file.status == 'success' && !file.openUrl && (
                                <span>
                                  {file.message || 'Your import has started'}
                                </span>
                              )}
                              {file.status == 'error' && (
                                <SpanBox css={{ color: 'red' }}>
                                  Error Uploading
                                </SpanBox>
                              )}
                            </HStack>
                          ) : (
                            <ProgressRoot value={file.progress} max={100}>
                              <ProgressIndicator
                                style={{
                                  transform: `translateX(-${
                                    100 - file.progress
                                  }%)`,
                                }}
                              />{' '}
                            </ProgressRoot>
                          )}
                        </HStack>
                      )
                    })}
                  </VStack>
                </DragnDropContainer>
                <input {...getInputProps()} />
              </div>
            )}
          </Dropzone>
        </VStack>
      </ModalContent>
    </ModalRoot>
  )
}
