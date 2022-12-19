import { useCallback, useMemo, useState } from 'react'
import { Toaster } from 'react-hot-toast'

import { showErrorToast, showSuccessToast } from '../../../lib/toastHelpers'
import { applyStoredTheme } from '../../../lib/themeUpdater'

import {
  Box,
  HStack,
  SpanBox,
  VStack,
} from '../../../components/elements/LayoutPrimitives'
import { PrimaryLayout } from '../../../components/templates/PrimaryLayout'

import 'antd/dist/antd.compact.css'
import { StyledText } from '../../../components/elements/StyledText'
import { Button } from '../../../components/elements/Button'
import { ProfileLayout } from '../../../components/templates/ProfileLayout'
import { FormLabel } from '../../../components/elements/FormElements'
import { uploadImportFileRequestMutation } from '../../../lib/networking/mutations/uploadImportFileMutation'

export default function ImportUploader(): JSX.Element {
  applyStoredTheme(false)

  const [errorMessage, setErrorMessage] = useState<string | undefined>()
  const [file, setFile] = useState<File>()
  const [type, setType] = useState<string>()

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  const handleUploadClick = async () => {
    if (!file) {
      return
    }

    console.log('file type: ', file.type)

    try {
      const result = await uploadImportFileRequestMutation(
        'URL_LIST',
        'text/csv'
      )

      if (result && result.uploadSignedUrl) {
        const uploadRes = await fetch(result.uploadSignedUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'content-type': 'text/csv',
            'content-length': `${file.size}`,
          },
        })
        console.log('upload result: ', uploadRes)
      }
    } catch (error) {
      console.log('caught error', error)
      if (error == 'UPLOAD_DAILY_LIMIT_EXCEEDED') {
        setErrorMessage('You have exceeded your maximum daily upload limit.')
      }
    }
  }

  return (
    <ProfileLayout>
      <VStack
        alignment="center"
        css={{
          padding: '16px',
          background: 'white',
          minWidth: '340px',
          width: '70vw',
          maxWidth: '576px',
          borderRadius: '8px',
          boxShadow: 'rgb(224 224 224) 9px 9px 9px -9px',
        }}
      >
        <VStack
          css={{ width: '100%', minWidth: '320px', gap: '16px', pb: '16px' }}
        ></VStack>
        <SpanBox css={{ width: '100%' }}>
          <FormLabel>Type</FormLabel>
          <select
            onChange={(event) => setType('')}
            style={{
              padding: '8px',
              height: '38px',
              borderRadius: '6px',
              minWidth: '196px',
            }}
          >
            <option value="URL_LIST">CSV of URLs</option>
            <option value="POCKET">Pocket export file</option>
          </select>
        </SpanBox>

        <SpanBox css={{ width: '100%' }}>
          <FormLabel>File</FormLabel>
          <HStack css={{ py: '16px' }} distribution="center">
            <input type="file" onChange={handleFileChange} />
            <div>{file && `${file.name} - ${file.type}`}</div>
          </HStack>
        </SpanBox>

        {errorMessage && <StyledText style="error">{errorMessage}</StyledText>}
        <Button
          onClick={handleUploadClick}
          style="ctaDarkYellow"
          css={{ my: '$2' }}
        >
          Upload File
        </Button>
      </VStack>
    </ProfileLayout>
  )
}
