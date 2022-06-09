/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ResolverFn,
  UploadFileRequestResult,
  MutationUploadFileRequestArgs,
  UploadFileStatus,
  UploadFileRequestErrorCode,
  ArticleSavingRequestStatus,
} from '../../generated/graphql'
import { WithDataSourcesContext } from '../types'
import {
  generateUploadSignedUrl,
  generateUploadFilePathName,
} from '../../utils/uploads'
import path from 'path'
import normalizeUrl from 'normalize-url'
import { analytics } from '../../utils/analytics'
import { env } from '../../env'
import { createPage, getPageByParam, updatePage } from '../../elastic/pages'
import { PageType } from '../../elastic/types'
import { generateSlug } from '../../utils/helpers'
import { validateUrl } from '../../services/create_page_save_request'

const isFileUrl = (url: string): boolean => {
  const parsedUrl = new URL(url)
  return parsedUrl.protocol == 'file://'
}

export const uploadFileRequestResolver: ResolverFn<
  UploadFileRequestResult,
  unknown,
  WithDataSourcesContext,
  MutationUploadFileRequestArgs
> = async (_obj, { input }, ctx) => {
  const { models, kx, claims } = ctx
  let uploadFileData: { id: string | null } = {
    id: null,
  }

  if (!claims?.uid) {
    return { errorCodes: [UploadFileRequestErrorCode.Unauthorized] }
  }

  analytics.track({
    userId: claims.uid,
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
        console.log('illegal file input url', error)
        return {
          errorCodes: [UploadFileRequestErrorCode.BadInput],
        }
      }
    }
  } catch {
    return { errorCodes: [UploadFileRequestErrorCode.BadInput] }
  }

  uploadFileData = await models.uploadFile.create({
    url: input.url,
    userId: claims.uid,
    fileName: fileName,
    status: UploadFileStatus.Initialized,
    contentType: input.contentType,
  })

  if (uploadFileData.id) {
    const uploadFilePathName = generateUploadFilePathName(
      uploadFileData.id,
      fileName
    )
    const uploadSignedUrl = await generateUploadSignedUrl(
      uploadFilePathName,
      input.contentType
    )

    let createdPageId: string | undefined = undefined
    if (input.createPageEntry) {
      // If we have a file:// URL, don't try to match it
      // and create a copy of the page, just create a
      // new item.
      const page = isFileUrl(input.url) ? await getPageByParam({
        userId: claims.uid,
        url: input.url,
      }) : undefined

      if (page) {
        if (
          !(await updatePage(
            page.id,
            {
              savedAt: new Date(),
              archivedAt: null,
            },
            ctx
          ))
        ) {
          return { errorCodes: [UploadFileRequestErrorCode.FailedCreate] }
        }
        createdPageId = page.id
      } else {
        const pageId = await createPage(
          {
            url: input.url,
            id: input.clientRequestId || '',
            userId: claims.uid,
            title: title,
            hash: uploadFilePathName,
            content: '',
            pageType: PageType.File,
            uploadFileId: uploadFileData.id,
            slug: generateSlug(uploadFilePathName),
            createdAt: new Date(),
            savedAt: new Date(),
            readingProgressPercent: 0,
            readingProgressAnchorIndex: 0,
            state: ArticleSavingRequestStatus.Succeeded,
          },
          ctx
        )
        if (!pageId) {
          return { errorCodes: [UploadFileRequestErrorCode.FailedCreate] }
        }
        createdPageId = pageId
      }
    }

    return {
      id: uploadFileData.id,
      uploadSignedUrl,
      createdPageId: createdPageId,
    }
  } else {
    return { errorCodes: [UploadFileRequestErrorCode.FailedCreate] }
  }
}
