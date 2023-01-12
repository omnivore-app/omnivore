import { authorized } from '../../utils/helpers'
import {
  UploadImportFileErrorCode,
  MutationUploadImportFileArgs,
  UploadImportFileError,
  UploadImportFileSuccess,
} from '../../generated/graphql'
import { getRepository } from '../../entity/utils'
import { User } from '../../entity/user'
import { analytics } from '../../utils/analytics'
import { env } from '../../env'
import { DateTime } from 'luxon'
import {
  countOfFilesWithPrefix,
  generateUploadSignedUrl,
} from '../../utils/uploads'
import { v4 as uuidv4 } from 'uuid'
import { buildLogger } from '../../utils/logger'

const MAX_DAILY_UPLOADS = 4
const VALID_CONTENT_TYPES = ['text/csv', 'application/zip']

const logger = buildLogger('app.dispatch')

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
>(async (_, { type, contentType }, { claims: { uid }, log }) => {
  log.info('uploadImportFileResolver')

  if (!VALID_CONTENT_TYPES.includes(contentType)) {
    return {
      errorCodes: [UploadImportFileErrorCode.BadRequest],
    }
  }

  const user = await getRepository(User).findOneBy({ id: uid })
  if (!user) {
    return {
      errorCodes: [UploadImportFileErrorCode.Unauthorized],
    }
  }

  analytics.track({
    userId: uid,
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

  if (fileCount > MAX_DAILY_UPLOADS) {
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
