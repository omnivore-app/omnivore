import { useCallback, useRef, useState } from 'react'
import * as Progress from '@radix-ui/react-progress'
import { File, Info } from '@phosphor-icons/react'
import { locale, timeZone } from '../../lib/dateFormatting'
import { showErrorToast, showSuccessToast } from '../../lib/toastHelpers'
import { Button } from '../elements/Button'
import { FormInput } from '../elements/FormElements'
import { Box, HStack, SpanBox, VStack } from '../elements/LayoutPrimitives'
import {
  ModalContent,
  ModalOverlay,
  ModalRoot,
} from '../elements/ModalPrimitives'
import { CloseButton } from '../elements/CloseButton'
import { styled } from '@stitches/react'
import Dropzone, {
  Accept,
  DropEvent,
  DropzoneRef,
  FileRejection,
} from 'react-dropzone'
import { v4 as uuidv4 } from 'uuid'
import { validateCsvFile } from '../../utils/csvValidator'
import {
  uploadImportFileRequestMutation,
  UploadImportFileType,
} from '../../lib/networking/mutations/uploadImportFileMutation'
import { uploadFileRequestMutation } from '../../lib/networking/mutations/uploadFileMutation'
import axios from 'axios'
import { theme } from '../tokens/stitches.config'
import { formatMessage } from '../../locales/en/messages'
import { subscribeMutation } from '../../lib/networking/mutations/subscribeMutation'
import { SubscriptionType } from '../../lib/networking/queries/useGetSubscriptionsQuery'

type TabName = 'link' | 'feed' | 'opml' | 'pdf' | 'import'

type AddLinkModalProps = {
  onOpenChange: (open: boolean) => void
  handleLinkSubmission: (
    link: string,
    timezone: string,
    locale: string
  ) => Promise<void>
}

export function AddLinkModal(props: AddLinkModalProps): JSX.Element {
  const [selectedTab, setSelectedTab] = useState('link')

  return (
    <ModalRoot defaultOpen onOpenChange={props.onOpenChange} css={{}}>
      <ModalOverlay />
      <ModalContent
        css={{
          p: '20px',
          bg: '$modalBackground',
          maxWidth: '600',
          maxHeight: '300',
          fontFamily: '$inter',
        }}
        onInteractOutside={(event) => {
          event.preventDefault()
        }}
      >
        <VStack distribution="start" css={{ gap: '20px' }}>
          <TabBar
            selectedTab={selectedTab}
            setSelectedTab={setSelectedTab}
            onOpenChange={props.onOpenChange}
          />
          <Box css={{ width: '100%' }}>
            {selectedTab == 'link' && <AddLinkTab {...props} />}
            {selectedTab == 'feed' && <AddFeedTab {...props} />}
            {selectedTab == 'opml' && <UploadOPMLTab />}
            {selectedTab == 'pdf' && <UploadPDFTab />}
            {selectedTab == 'import' && <UploadImportTab {...props} />}
          </Box>
        </VStack>
      </ModalContent>
    </ModalRoot>
  )
}

const AddLinkTab = (props: AddLinkModalProps): JSX.Element => {
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  )

  const addLink = useCallback(
    async (link: string) => {
      await props.handleLinkSubmission(link, timeZone, locale)
      props.onOpenChange(false)
    },
    [props, errorMessage, setErrorMessage]
  )

  return (
    <AddFromURL
      placeholder="https://example.com/"
      errorMessage={errorMessage}
      setErrorMessage={setErrorMessage}
      onSubmit={addLink}
    />
  )
}

const AddFeedTab = (props: AddLinkModalProps): JSX.Element => {
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  )

  const subscribe = useCallback(
    async (feedUrl: string) => {
      if (!feedUrl) {
        setErrorMessage('Please enter a valid feed URL')
        return
      }

      let normailizedUrl: string
      // normalize the url
      try {
        normailizedUrl = new URL(feedUrl.trim()).toString()
      } catch (e) {
        setErrorMessage('Please enter a valid feed URL')
        return
      }

      const result = await subscribeMutation({
        url: normailizedUrl,
        subscriptionType: SubscriptionType.RSS,
      })

      if (result.subscribe.errorCodes) {
        const errorMessage = formatMessage({
          id: `error.${result.subscribe.errorCodes[0]}`,
        })
        setErrorMessage(`There was an error adding new feed: ${errorMessage}`)
        return
      }

      showSuccessToast('New feed has been added.')
      props.onOpenChange(false)
    },
    [props, errorMessage, setErrorMessage]
  )

  return (
    <AddFromURL
      placeholder="https://example.com/feed.atom"
      errorMessage={errorMessage}
      setErrorMessage={setErrorMessage}
      onSubmit={subscribe}
    />
  )
}

type AddFromURLProps = {
  placeholder: string
  errorMessage: string | undefined
  setErrorMessage: (message: string) => void
  onSubmit: (url: string) => Promise<void>
}

const AddFromURL = (props: AddFromURLProps): JSX.Element => {
  const [url, setURL] = useState('')

  const validateURL = useCallback((link: string) => {
    try {
      const url = new URL(link)
      if (url.protocol !== 'https:' && url.protocol !== 'http:') {
        return false
      }
    } catch (e) {
      return false
    }
    return true
  }, [])

  return (
    <VStack css={{ width: '100%', height: '180px' }}>
      <form
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          paddingTop: '5px',
        }}
        onSubmit={async (event) => {
          event.preventDefault()

          if (!validateURL(url)) {
            props.setErrorMessage('Invalid URL')
            return
          }

          props.onSubmit(url)
        }}
      >
        <FormInput
          type="url"
          value={url}
          autoFocus={true}
          placeholder={props.placeholder}
          onChange={(event) => setURL(event.target.value)}
          css={{
            borderRadius: '4px',
            width: '100%',
            height: '38px',
            p: '6px',
            mb: '13px',
            fontSize: '14px',
            color: '$thTextContrast',
            bg: '$thFormInput',
          }}
        />
        {props.errorMessage && (
          <HStack
            distribution="start"
            alignment="start"
            css={{
              width: '100%',
              bg: '#FF000010',
              p: '5px',
              pl: '10px',
              fontSize: '12px',
              fontFamily: '$inter',
              textAlign: 'center',
              color: '$ctaBlue',
              borderRadius: '5px',
            }}
          >
            <HStack
              distribution="start"
              alignment="center"
              css={{ gap: '5px', whiteSpace: 'pre-line', color: 'red' }}
            >
              <Info size={14} color="red" />
              {props.errorMessage}
            </HStack>
          </HStack>
        )}
        <Button
          style="ctaOmnivoreYellow"
          type="submit"
          css={{
            marginLeft: 'auto',
            marginTop: 'auto',
          }}
        >
          Add
        </Button>
      </form>
    </VStack>
  )
}

const UploadOPMLTab = (): JSX.Element => {
  return (
    <VStack
      alignment="start"
      distribution="start"
      css={{ height: '180px', width: '100%' }}
    >
      <UploadPad
        description="Drag OPML file to add feeds"
        accept={{
          'text/csv': ['.csv'],
          'application/zip': ['.zip'],
          'application/pdf': ['.pdf'],
          'application/epub+zip': ['.epub'],
        }}
      />
    </VStack>
  )
}

const UploadPDFTab = (): JSX.Element => {
  return (
    <VStack
      alignment="start"
      distribution="start"
      css={{ height: '180px', width: '100%' }}
    >
      <UploadPad
        info={
          <HStack
            distribution="start"
            alignment="center"
            css={{ gap: '5px', whiteSpace: 'pre-line' }}
          >
            <Info size={14} color="#007AFF" />
            PDFs have a maximum size of 8MB.{' '}
          </HStack>
        }
        description="Drag PDFs here to add to your library"
        accept={{
          'application/pdf': ['.pdf'],
        }}
      />
    </VStack>
  )
}

const UploadImportTab = (props: AddLinkModalProps): JSX.Element => {
  return (
    <VStack
      alignment="start"
      distribution="start"
      css={{ height: '180px', width: '100%' }}
    >
      <UploadPad
        info={
          <HStack
            distribution="start"
            alignment="center"
            css={{ gap: '5px', whiteSpace: 'pre-line' }}
          >
            <Info size={14} color="#007AFF" />
            Imports must be in a supported format.{' '}
            <a
              href="https://docs.omnivore.app/using/importing.html"
              target="_blank"
              rel="noreferrer"
              style={{ color: '#007AFF' }}
            >
              Read more
            </a>
          </HStack>
        }
        description="Drop import files here"
        accept={{
          'text/csv': ['.csv'],
          'application/zip': ['.zip'],
        }}
      />
    </VStack>
  )
}

const DragnDropContainer = styled('div', {
  width: '100%',
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: '1',
  alignSelf: 'center',
  left: 0,
  flexDirection: 'column',
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

type UploadPadProps = {
  info?: React.ReactNode
  description: string
  accept: Accept
}

const UploadPad = (props: UploadPadProps): JSX.Element => {
  const [uploadFiles, setUploadFiles] = useState<UploadingFile[]>([])
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
    <VStack
      distribution="start"
      css={{ gap: '10px', width: '100%', height: '100%' }}
    >
      {props.info && (
        <HStack
          distribution="start"
          alignment="start"
          css={{
            width: '100%',
            bg: '#007AFF10',
            p: '5px',
            pl: '10px',
            fontSize: '12px',
            fontFamily: '$inter',
            textAlign: 'center',
            color: '$ctaBlue',
            borderRadius: '5px',
          }}
        >
          {props.info}
        </HStack>
      )}
      <Dropzone
        ref={dropzoneRef}
        onDragEnter={() => {
          setInDragOperation(true)
        }}
        onDragLeave={() => {
          setInDragOperation(false)
        }}
        onDropAccepted={handleAcceptedFiles}
        onDropRejected={(fileRejections: FileRejection[], event: DropEvent) => {
          console.log('onDropRejected: ', fileRejections, event)
          alert('You can only upload PDF files to your Omnivore Library.')
          setInDragOperation(false)
          event.preventDefault()
        }}
        preventDropOnDocument={true}
        noClick={true}
        accept={props.accept}
      >
        {({ getRootProps, getInputProps, acceptedFiles, fileRejections }) => (
          <div
            {...getRootProps({ className: 'dropzone' })}
            style={{ width: '100%', height: '100%' }}
          >
            <DragnDropContainer>
              <DragnDropStyle>
                <DragnDropIndicator
                  css={{
                    border: inDragOperation ? '2px dashed blue' : 'unset',
                  }}
                >
                  <VStack
                    alignment="center"
                    css={{ gap: '20px', height: '100%' }}
                  >
                    <File
                      size={40}
                      color={theme.colors.tabTextUnselected.toString()}
                    />
                    {inDragOperation ? (
                      <>
                        <Box
                          css={{
                            p: '0px',
                            fontSize: '12px',
                            fontFamily: '$inter',
                            textAlign: 'center',
                            color: '$tabTextUnselected',
                          }}
                        >
                          Drop to upload your file
                        </Box>
                      </>
                    ) : (
                      <>
                        {(!uploadFiles || uploadFiles.length == 0) && (
                          <Box
                            css={{
                              fontSize: '12px',
                              fontFamily: '$inter',
                              textAlign: 'center',
                              color: '$tabTextUnselected',
                            }}
                          >
                            {props.description}
                            <br /> or{' '}
                            <a href="" onClick={openDialog}>
                              choose your files
                            </a>
                          </Box>
                        )}
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
                        border: '1px dashed $grayBorder',
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
                              transform: `translateX(-${100 - file.progress}%)`,
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
  )
}

type TabBarProps = {
  selectedTab: string
  setSelectedTab: (selected: TabName) => void

  onOpenChange: (open: boolean) => void
}

const TabBar = (props: TabBarProps) => {
  return (
    <HStack
      distribution="between"
      alignment="center"
      css={{ width: '100%', gap: '4px' }}
    >
      <Button
        style={props.selectedTab == 'link' ? 'tabSelected' : 'tab'}
        onClick={(event) => {
          props.setSelectedTab('link')
          event.preventDefault()
        }}
      >
        Link
      </Button>
      <Button
        style={props.selectedTab == 'pdf' ? 'tabSelected' : 'tab'}
        onClick={(event) => {
          props.setSelectedTab('pdf')
          event.preventDefault()
        }}
      >
        PDF
      </Button>
      <Button
        style={props.selectedTab == 'feed' ? 'tabSelected' : 'tab'}
        onClick={(event) => {
          props.setSelectedTab('feed')
          event.preventDefault()
        }}
      >
        Feed
      </Button>
      {/* <Button
        style={props.selectedTab == 'opml' ? 'tabSelected' : 'tab'}
        onClick={(event) => {
          props.setSelectedTab('opml')
          event.preventDefault()
        }}
      >
        OPML
      </Button> */}
      <Button
        style={props.selectedTab == 'import' ? 'tabSelected' : 'tab'}
        onClick={(event) => {
          props.setSelectedTab('import')
          event.preventDefault()
        }}
      >
        Import
      </Button>

      <SpanBox css={{ ml: 'auto' }}>
        <CloseButton close={() => props.onOpenChange(false)} />
      </SpanBox>
    </HStack>
  )
}
