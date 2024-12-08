import path from 'path'
import { In } from 'typeorm'
import { v4 as uuid } from 'uuid'
import { LibraryItemState } from '../entity/library_item'
import { UploadFile } from '../entity/upload_file'
import {
  PageType,
  UploadFileRequestErrorCode,
  UploadFileRequestInput,
  UploadFileStatus,
} from '../generated/graphql'
import { authTrx, getRepository } from '../repository'
import { cleanUrl, generateSlug } from '../utils/helpers'
import { logger } from '../utils/logger'
import {
  contentReaderForLibraryItem,
  generateUploadFilePathName,
  generateUploadSignedUrl,
} from '../utils/uploads'
import { validateUrl } from './create_page_save_request'
import { createOrUpdateLibraryItem } from './library_item'

export const batchGetUploadFilesByIds = async (
  ids: readonly string[]
): Promise<(UploadFile | undefined)[]> => {
  const uploadFiles = await getRepository(UploadFile).findBy({
    id: In(ids as string[]),
  })

  return ids.map((id) => uploadFiles.find((uploadFile) => uploadFile.id === id))
}

const isFileUrl = (url: string): boolean => {
  const parsedUrl = new URL(url)
  return parsedUrl.protocol == 'file:'
}

export const itemTypeForContentType = (contentType: string) => {
  if (contentType == 'application/epub+zip') {
    return PageType.Book
  }
  return PageType.File
}

export const findUploadFileById = async (id: string) => {
  return getRepository(UploadFile).findOne({
    where: { id },
    relations: {
      user: true,
    },
  })
}

export const setFileUploadComplete = async (id: string, userId?: string) => {
  return authTrx(
    async (tx) => {
      const repo = tx.getRepository(UploadFile)
      await repo.update(id, { status: 'COMPLETED' })

      return repo.findOneByOrFail({ id })
    },
    {
      uid: userId,
    }
  )
}

export const uploadFile = async (
  input: UploadFileRequestInput,
  uid: string
) => {
  let url = input.url
  let title: string
  let fileName: string
  try {
    url = cleanUrl(new URL(url).href)
    title = decodeURI(path.basename(new URL(url).pathname, '.pdf'))
    fileName = decodeURI(path.basename(new URL(url).pathname)).replace(
      /[^a-zA-Z0-9-_.]/g,
      ''
    )

    if (!fileName) {
      fileName = 'content.pdf'
    }

    if (!isFileUrl(url)) {
      try {
        validateUrl(url)
      } catch (error) {
        logger.info('illegal file input url', error)
        return {
          errorCodes: [UploadFileRequestErrorCode.BadInput],
        }
      }
    }
  } catch {
    return {
      errorCodes: [UploadFileRequestErrorCode.BadInput],
    }
  }

  const uploadFileId = uuid()
  const uploadFilePathName = generateUploadFilePathName(uploadFileId, fileName)
  // If this is a file URL, we swap in a special URL
  if (isFileUrl(url)) {
    url = `https://omnivore.app/attachments/${uploadFilePathName}`
  }

  const uploadFileData = await authTrx((t) =>
    t.getRepository(UploadFile).save({
      id: uploadFileId,
      url: input.url,
      user: { id: uid },
      fileName,
      status: UploadFileStatus.Initialized,
      contentType: input.contentType,
    })
  )
  const uploadSignedUrl = await generateUploadSignedUrl(
    uploadFilePathName,
    input.contentType
  )

  const itemType = itemTypeForContentType(input.contentType)
  if (input.createPageEntry) {
    // If we have a file:// URL, don't try to match it
    // and create a copy of the item, just create a
    // new item.
    const item = await createOrUpdateLibraryItem(
      {
        id: input.clientRequestId || undefined,
        originalUrl: url,
        user: { id: uid },
        title,
        readableContent: '',
        itemType,
        uploadFile: { id: uploadFileData.id },
        slug: generateSlug(uploadFilePathName),
        state: LibraryItemState.Succeeded,
        contentReader: contentReaderForLibraryItem(itemType, uploadFileId),
      },
      uid
    )
    return {
      id: uploadFileId,
      uploadSignedUrl,
      createdPageId: item.id,
    }
  }

  return {
    id: uploadFileId,
    uploadSignedUrl,
  }
}
