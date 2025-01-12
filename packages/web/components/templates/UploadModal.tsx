import * as Progress from '@radix-ui/react-progress'
import { styled } from '@stitches/react'
import axios from 'axios'
import { File } from '@phosphor-icons/react'
import { useCallback, useRef, useState } from 'react'
import Dropzone, { DropEvent, DropzoneRef, FileRejection } from 'react-dropzone'
import { v4 as uuidv4 } from 'uuid'
import { uploadFileRequestMutation } from '../../lib/networking/mutations/uploadFileMutation'
import {
  uploadImportFileRequestMutation,
  UploadImportFileType,
} from '../../lib/networking/mutations/uploadImportFileMutation'
import { showErrorToast } from '../../lib/toastHelpers'
import { validateCsvFile } from '../../utils/csvValidator'
import { Box, HStack, SpanBox, VStack } from '../elements/LayoutPrimitives'
import {
  ModalContent,
  ModalOverlay,
  ModalRoot,
  ModalTitleBar,
} from '../elements/ModalPrimitives'
import { theme } from '../tokens/stitches.config'

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
    (event: React.MouseEvent) => {
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
    let { contentType } = file
    if (
      contentType == 'application/vnd.ms-excel' &&
      file.name.endsWith('.csv')
    ) {
      contentType = 'text/csv'
    }
    switch (contentType) {
      case 'text/csv': {
        let urlCount = 0
        try {
          const csvData = await validateCsvFile(file.file)
          urlCount = csvData.data.length
          if (urlCount > 5000) {
            return {
              message:
                'Due to an increase in traffic we are limiting CSV imports to 5000 items.',
            }
          }
          if (csvData.inValidData.length > 0) {
            return {
              message: csvData.inValidData[0].message,
            }
          }
          if (urlCount === 0) {
            return {
              message: 'No URLs found in CSV file.',
            }
          }
        } catch (error) {
          return {
            message: 'Invalid CSV file.',
          }
        }

        try {
          const result = await uploadImportFileRequestMutation(
            UploadImportFileType.URL_LIST,
            contentType
          )
          return {
            uploadSignedUrl: result?.uploadSignedUrl,
            message: `Importing ${urlCount} URLs`,
          }
        } catch (error) {
          console.log('caught error', error)
          if (error == 'UPLOAD_DAILY_LIMIT_EXCEEDED') {
            return {
              message: 'You have exceeded your maximum daily upload limit.',
            }
          }
        }
      }
      case 'application/zip': {
        const result = await uploadImportFileRequestMutation(
          UploadImportFileType.MATTER,
          contentType
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
          contentType: contentType,
          createPageEntry: true,
        })
        return {
          uploadSignedUrl: request?.uploadSignedUrl,
          requestId: request?.createdPageId,
        }
      }
    }
    return {
      message: `Invalid content type: ${contentType}`,
    }
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
            const uploadInfo = await uploadSignedUrlForFile(file)
            if (!uploadInfo.uploadSignedUrl) {
              const message = uploadInfo.message || 'No upload URL available'
              showErrorToast(message, { duration: 10000 })
              file.status = 'error'
              setUploadFiles([...allFiles])
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
        onInteractOutside={(event) => {
          event.preventDefault()
        }}
      >
        <VStack distribution="start">
          <ModalTitleBar
            title="Upload file"
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
