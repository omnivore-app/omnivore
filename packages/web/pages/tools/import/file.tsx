import 'antd/dist/antd.compact.css'
import { ChangeEvent, useState } from 'react'
import { SyncLoader } from 'react-spinners'
import { Button } from '../../../components/elements/Button'
import { FormLabel } from '../../../components/elements/FormElements'
import { HStack, VStack } from '../../../components/elements/LayoutPrimitives'
import { StyledText } from '../../../components/elements/StyledText'
import { ProfileLayout } from '../../../components/templates/ProfileLayout'
import { theme } from '../../../components/tokens/stitches.config'
import {
  uploadImportFileRequestMutation,
  UploadImportFileType,
} from '../../../lib/networking/mutations/uploadImportFileMutation'
import { applyStoredTheme } from '../../../lib/themeUpdater'
import { validateCsvFile } from '../../../utils/csvValidator'

type UploadState = 'none' | 'uploading' | 'completed'

export default function ImportUploader(): JSX.Element {
  applyStoredTheme()

  const [errorMessage, setErrorMessage] = useState<string | undefined>()
  const [file, setFile] = useState<File>()
  const [type, setType] = useState<UploadImportFileType>()
  const [uploadState, setUploadState] = useState<UploadState>('none')

  const onFinish = (values: unknown) => {
    console.log(values)
  }

  const onTypeChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  const handleUploadClick = async () => {
    if (!file) {
      setErrorMessage('No file selected.')
      return
    }

    if (!type) {
      setErrorMessage('No file type selected.')
      return
    }

    setUploadState('uploading')

    try {
      if (type == UploadImportFileType.URL_LIST) {
        // validate csv file
        try {
          const csvData = await validateCsvFile(file)
          if (csvData.inValidData.length > 0) {
            setErrorMessage(csvData.inValidData[0].message)
            setUploadState('none')
            return
          }
        } catch (error) {
          console.log(error)
          setErrorMessage('Invalid CSV file.')
          setUploadState('none')
          return
        }
      }

      const result = await uploadImportFileRequestMutation(type, 'text/csv')

      if (result && result.uploadSignedUrl) {
        const uploadRes = await fetch(result.uploadSignedUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'content-type': 'text/csv',
            'content-length': `${file.size}`,
          },
        })
        if (!uploadRes) {
          setErrorMessage(
            'Unable to create file upload. Please ensure you are logged in.'
          )
          setUploadState('none')
        }
        setUploadState('completed')
      } else {
        setErrorMessage(
          'Unable to create file upload. Please ensure you are logged in.'
        )
        setUploadState('none')
      }
    } catch (error) {
      console.log('caught error', error)
      if (error == 'UPLOAD_DAILY_LIMIT_EXCEEDED') {
        setErrorMessage('You have exceeded your maximum daily upload limit.')
      }
      setUploadState('none')
    }
  }

  return (
    <ProfileLayout>
      <VStack
        alignment="start"
        css={{
          padding: '16px',
          background: 'white',
          minWidth: '340px',
          width: '70vw',
          maxWidth: '576px',
          borderRadius: '8px',
          border: '1px solid #3D3D3D',
          boxShadow: '#B1B1B1 9px 9px 9px -9px',
        }}
      >
        <StyledText
          style="modalHeadline"
          css={{ color: theme.colors.omnivoreGray.toString() }}
        >
          Upload a file to import
        </StyledText>
        <StyledText
          style="caption"
          css={{ pt: '10px', color: theme.colors.omnivoreGray.toString() }}
        >
          Omnivore supports uploading a CSV file with one URL per a Row or a
          _matter_history.csv file for users migrating from the Matter app
        </StyledText>
        <StyledText
          style="caption"
          css={{ pt: '10px', color: theme.colors.omnivoreGray.toString() }}
        >
          <b>Importing from Matter:</b> If you are a Matter user, export your
          data, unzip the Archive.zip file, select `Matter history` on this
          page, and upload the _matter_history file that was extracted from the
          Archive.zip file.
        </StyledText>
        <StyledText
          style="caption"
          css={{ pt: '10px', color: theme.colors.omnivoreGray.toString() }}
        >
          <b>Importing from other apps:</b> Most apps allow you to export your
          saved items as a CSV file. Once you have extracted a file, ensure the
          first column of each row is a URL, and choose our `CSV of URLs` option
          and upload your file.
        </StyledText>
        <StyledText
          style="caption"
          css={{ pt: '10px', color: theme.colors.omnivoreGray.toString() }}
        >
          <b>Note:</b> Please note you are limited to three import uploads per a
          day, and the maximum file size is 10MB.
        </StyledText>
        <VStack css={{ pt: '36px' }}>
          {uploadState == 'completed' ? (
            <StyledText
              style="caption"
              css={{
                pt: '10px',
                pb: '20px',
                color: theme.colors.omnivoreGray.toString(),
              }}
            >
              Your upload has completed. Please note that it can take some time
              for your library to be updated. You will be sent an email when the
              process completes.
            </StyledText>
          ) : (
            <>
              <HStack>
                <StyledText
                  style="caption"
                  css={{
                    height: '38px',
                    width: '88px',
                    fontWeight: 'bold',
                    color: theme.colors.omnivoreGray.toString(),
                  }}
                >
                  File type:
                </StyledText>
                <select
                  disabled={uploadState == 'uploading'}
                  onChange={(event) => {
                    const changeType: UploadImportFileType =
                      UploadImportFileType[
                        event.currentTarget
                          .value as keyof typeof UploadImportFileType
                      ]
                    setType(changeType)
                  }}
                  style={{
                    padding: '8px',
                    height: '38px',
                    borderRadius: '6px',
                    minWidth: '196px',
                    color: theme.colors.omnivoreGray.toString(),
                  }}
                >
                  <option value="none">Choose file type</option>
                  <option value="URL_LIST">CSV of URLs</option>
                  <option value="MATTER">Matter history</option>
                </select>
              </HStack>

              <HStack css={{ width: '100%' }}>
                <FormLabel
                  css={{
                    height: '38px',
                    width: '88px',
                    color: theme.colors.omnivoreGray.toString(),
                  }}
                ></FormLabel>
                <HStack css={{ py: '16px' }} distribution="start">
                  <input
                    type="file"
                    onChange={onTypeChange}
                    disabled={uploadState == 'uploading'}
                    accept=".csv"
                  />
                  {/* <Box>{file && `${file.name}`}</Box> */}
                </HStack>
              </HStack>
            </>
          )}

          <HStack css={{ width: '100%' }} distribution="start">
            <FormLabel css={{ height: '38px', width: '88px' }}></FormLabel>
            {uploadState == 'none' && (
              <Button onClick={handleUploadClick} style="ctaDarkYellow">
                Upload
              </Button>
            )}
            {uploadState == 'uploading' && (
              <SyncLoader
                color={theme.colors.omnivoreGray.toString()}
                size={8}
              />
            )}
            {uploadState == 'completed' && (
              <Button
                onClick={(e) => {
                  window.location.href = '/l/home'
                  e.preventDefault()
                }}
                style="ctaDarkYellow"
              >
                Return to Library
              </Button>
            )}
          </HStack>

          <HStack css={{ width: '100%', pt: '10px' }} distribution="start">
            <FormLabel css={{ height: '38px', width: '88px' }}></FormLabel>
            {errorMessage && (
              <StyledText style="error">{errorMessage}</StyledText>
            )}
          </HStack>
        </VStack>
      </VStack>
    </ProfileLayout>
  )
}
