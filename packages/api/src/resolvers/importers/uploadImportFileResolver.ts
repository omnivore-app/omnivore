import { DateTime } from 'luxon'
import { v4 as uuidv4 } from 'uuid'
import { env } from '../../env'
import {
  MutationUploadImportFileArgs,
  UploadImportFileError,
  UploadImportFileErrorCode,
  UploadImportFileSuccess,
} from '../../generated/graphql'
import { userRepository } from '../../repository/user'
import { analytics } from '../../utils/analytics'
import { authorized } from '../../utils/gql-utils'
import { logger } from '../../utils/logger'
import {
  countOfFilesWithPrefix,
  generateUploadSignedUrl,
} from '../../utils/uploads'

const VALID_CONTENT_TYPES = ['text/csv', 'application/zip']

const extensionForContentType = (contentType: string) => {
  switch (contentType) {
    case 'text/csv':
      return 'csv'
    case 'application/zip':
      return 'zip'
  }
  return '.unknown'
}

export const uploadImportFileResolver = authorized<
  UploadImportFileSuccess,
  UploadImportFileError,
  MutationUploadImportFileArgs
>(async (_, { type, contentType }, { uid }) => {
  if (!VALID_CONTENT_TYPES.includes(contentType)) {
    return {
      errorCodes: [UploadImportFileErrorCode.BadRequest],
    }
  }

  const user = await userRepository.findById(uid)
  if (!user) {
    return {
      errorCodes: [UploadImportFileErrorCode.Unauthorized],
    }
  }

  analytics.capture({
    distinctId: uid,
    event: 'upload_import_file',
    properties: {
      type,
      env: env.server.apiEnv,
    },
  })

  // path style: imports/<uid>/<date>/<type>-<uuid>
  const dateStr = DateTime.now().toISODate()
  const dirPath = `imports/${uid}/${dateStr}/`
  const fileCount = await countOfFilesWithPrefix(dirPath)

  const MAX_DAILY_UPLOADS = env.fileUpload.dailyUploadLimit
  if (fileCount >= MAX_DAILY_UPLOADS) {
    return {
      errorCodes: [UploadImportFileErrorCode.UploadDailyLimitExceeded],
    }
  }

  try {
    const fileUuid = uuidv4()
    const ext = extensionForContentType(contentType)
    const fullPath = `${dirPath}${type}-${fileUuid}.${ext}`
    const uploadSignedUrl = await generateUploadSignedUrl(fullPath, contentType)

    return {
      uploadSignedUrl,
    }
  } catch (error) {
    logger.error('Error creating uploadSignedUrl', {
      error,
      type,
      contentType,
    })

    return {
      errorCodes: [UploadImportFileErrorCode.BadRequest],
    }
  }
})
