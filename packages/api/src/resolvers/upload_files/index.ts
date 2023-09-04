/* eslint-disable @typescript-eslint/no-unused-vars */
import normalizeUrl from 'normalize-url'
import path from 'path'
import { LibraryItemState, LibraryItemType } from '../../entity/library_item'
import { UploadFile } from '../../entity/upload_file'
import { env } from '../../env'
import {
  MutationUploadFileRequestArgs,
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
  generateUploadFilePathName,
  generateUploadSignedUrl,
  getFilePublicUrl,
} from '../../utils/uploads'

const isFileUrl = (url: string): boolean => {
  const parsedUrl = new URL(url)
  return parsedUrl.protocol == 'file:'
}

export const itemTypeForContentType = (
  contentType: string
): LibraryItemType => {
  if (contentType == 'application/epub+zip') {
    return LibraryItemType.Book
  }
  return LibraryItemType.File
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
      userId: uid,
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

    const publicUrl = getFilePublicUrl(uploadFilePathName)

    // If this is a file URL, we swap in the GCS public URL
    if (isFileUrl(input.url)) {
      await authTrx(async (tx) => {
        await tx.getRepository(UploadFile).update(uploadFileId, {
          url: publicUrl,
          status: UploadFileStatus.Initialized,
        })
      })
    }

    let createdItemId: string | undefined = undefined
    if (input.createPageEntry) {
      // If we have a file:// URL, don't try to match it
      // and create a copy of the page, just create a
      // new item.
      const item = isFileUrl(input.url)
        ? await findLibraryItemByUrl(input.url, uid)
        : undefined

      if (item) {
        if (
          !(await updateLibraryItem(
            item.id,
            {
              savedAt: new Date(),
              archivedAt: null,
            },
            uid
          ))
        ) {
          return { errorCodes: [UploadFileRequestErrorCode.FailedCreate] }
        }
        createdItemId = item.id
      } else {
        const item = await createLibraryItem(
          {
            originalUrl: isFileUrl(input.url) ? publicUrl : input.url,
            id: input.clientRequestId || undefined,
            user: { id: uid },
            title,
            readableContent: '',
            itemType: itemTypeForContentType(input.contentType),
            uploadFile: { id: uploadFileData.id },
            slug: generateSlug(uploadFilePathName),
            state: LibraryItemState.Succeeded,
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
