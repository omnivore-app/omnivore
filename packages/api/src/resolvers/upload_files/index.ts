/* eslint-disable @typescript-eslint/no-unused-vars */
import normalizeUrl from 'normalize-url'
import path from 'path'
import { LibraryItemState } from '../../entity/library_item'
import { UploadFile } from '../../entity/upload_file'
import { env } from '../../env'
import {
  MutationUploadFileRequestArgs,
  PageType,
  UploadFileRequestError,
  UploadFileRequestErrorCode,
  UploadFileRequestSuccess,
  UploadFileStatus,
} from '../../generated/graphql'
import { validateUrl } from '../../services/create_page_save_request'
import {
  createLibraryItem,
  findLibraryItemByUrl,
  updateLibraryItem,
} from '../../services/library_item'
import { analytics } from '../../utils/analytics'
import { authorized, generateSlug } from '../../utils/helpers'
import {
  contentReaderForLibraryItem,
  generateUploadFilePathName,
  generateUploadSignedUrl,
} from '../../utils/uploads'

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

export const uploadFileRequestResolver = authorized<
  UploadFileRequestSuccess,
  UploadFileRequestError,
  MutationUploadFileRequestArgs
>(async (_, { input }, ctx) => {
  const { authTrx, uid, log } = ctx
  let uploadFileData: { id: string | null } = {
    id: null,
  }

  analytics.track({
    userId: uid,
    event: 'file_upload_request',
    properties: {
      url: input.url,
      env: env.server.apiEnv,
    },
  })

  let title: string
  let fileName: string
  try {
    const url = normalizeUrl(new URL(input.url).href, {
      stripHash: true,
      stripWWW: false,
    })
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
        log.info('illegal file input url', error)
        return {
          errorCodes: [UploadFileRequestErrorCode.BadInput],
        }
      }
    }
  } catch {
    return { errorCodes: [UploadFileRequestErrorCode.BadInput] }
  }

  uploadFileData = await authTrx((t) =>
    t.getRepository(UploadFile).save({
      url: input.url,
      user: { id: uid },
      fileName,
      status: UploadFileStatus.Initialized,
      contentType: input.contentType,
    })
  )

  if (uploadFileData.id) {
    const uploadFileId = uploadFileData.id
    const uploadFilePathName = generateUploadFilePathName(
      uploadFileId,
      fileName
    )
    const uploadSignedUrl = await generateUploadSignedUrl(
      uploadFilePathName,
      input.contentType
    )

    // If this is a file URL, we swap in a special URL
    const attachmentUrl = `https://omnivore.app/attachments/${uploadFilePathName}`
    if (isFileUrl(input.url)) {
      await authTrx(async (tx) => {
        await tx.getRepository(UploadFile).update(uploadFileId, {
          url: attachmentUrl,
          status: UploadFileStatus.Initialized,
        })
      })
    }

    let createdItemId: string | undefined = undefined
    if (input.createPageEntry) {
      // If we have a file:// URL, don't try to match it
      // and create a copy of the item, just create a
      // new item.
      const item = await findLibraryItemByUrl(input.url, uid)
      if (item) {
        await updateLibraryItem(
          item.id,
          {
            state: LibraryItemState.Processing,
          },
          uid
        )
        createdItemId = item.id
      } else {
        const itemType = itemTypeForContentType(input.contentType)
        const uploadFileId = uploadFileData.id
        const item = await createLibraryItem(
          {
            originalUrl: input.url,
            id: input.clientRequestId || undefined,
            user: { id: uid },
            title,
            readableContent: '',
            itemType,
            uploadFile: { id: uploadFileData.id },
            slug: generateSlug(uploadFilePathName),
            state: LibraryItemState.Processing,
            contentReader: contentReaderForLibraryItem(itemType, uploadFileId),
          },
          uid
        )
        createdItemId = item.id
      }
    }

    return {
      id: uploadFileData.id,
      uploadSignedUrl,
      createdPageId: createdItemId,
    }
  } else {
    return { errorCodes: [UploadFileRequestErrorCode.FailedCreate] }
  }
})
