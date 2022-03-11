import Knex from 'knex'
import { PubsubClient } from '../datalayer/pubsub'
import { UserData } from '../datalayer/user/model'
import { homePageURL } from '../env'
import {
  ArticleSavingRequestStatus,
  PageType,
  SaveErrorCode,
  SaveFileInput,
  SaveResult,
} from '../generated/graphql'
import { DataModels } from '../resolvers/types'
import { generateSlug } from '../utils/helpers'
import { getStorageFileDetails, makeStorageFilePublic } from '../utils/uploads'
import { createSavingRequest } from './save_page'
import { createPage, getPageByParam, updatePage } from '../elastic'

type SaveContext = {
  pubsub: PubsubClient
  models: DataModels
  authTrx: <TResult>(
    cb: (tx: Knex.Transaction) => TResult,
    userRole?: string
  ) => Promise<TResult>
}

export const saveFile = async (
  ctx: SaveContext,
  saver: UserData,
  input: SaveFileInput
): Promise<SaveResult> => {
  console.log('saving file with input', input)

  /* We do not trust the values from client, lookup upload file by querying
   * with filtering on user ID and URL to verify client's uploadFileId is valid.
   */
  const uploadFile = await ctx.models.uploadFile.getWhere({
    id: input.uploadFileId,
    userId: saver.id,
  })
  if (!uploadFile) {
    return {
      errorCodes: [SaveErrorCode.Unauthorized],
    }
  }

  const savingRequest = await createSavingRequest(
    ctx,
    saver.id,
    input.clientRequestId
  )

  const uploadFileDetails = await getStorageFileDetails(
    input.uploadFileId,
    uploadFile.fileName
  )

  const uploadFileData = await ctx.authTrx(async (tx) => {
    return ctx.models.uploadFile.setFileUploadComplete(input.uploadFileId, tx)
  })

  if (!uploadFileData || !uploadFileData.id || !uploadFileData.fileName) {
    console.log('error completing upload file request', input)
    return {
      errorCodes: [SaveErrorCode.Unknown],
    }
  }

  const uploadFileUrlOverride = await makeStorageFilePublic(
    uploadFileData.id,
    uploadFileData.fileName
  )

  const matchedUserArticleRecord = await getPageByParam({
    userId: saver.id,
    url: uploadFileUrlOverride,
  })

  if (matchedUserArticleRecord) {
    await updatePage(
      matchedUserArticleRecord.id,
      {
        savedAt: new Date(),
        archivedAt: null,
      },
      ctx
    )

    await ctx.authTrx(async (tx) => {
      await ctx.models.articleSavingRequest.update(
        savingRequest.id,
        {
          elasticPageId: matchedUserArticleRecord.id,
          status: ArticleSavingRequestStatus.Succeeded,
        },
        tx
      )
    })
  } else {
    const pageId = await createPage(
      {
        url: uploadFileUrlOverride,
        title: uploadFile.fileName,
        hash: uploadFileDetails.md5Hash,
        content: '',
        pageType: PageType.File,
        uploadFileId: input.uploadFileId,
        slug: generateSlug(uploadFile.fileName),
        userId: saver.id,
        id: '',
        createdAt: new Date(),
      },
      ctx
    )

    if (!pageId) {
      console.log('error creating page in elastic', input)
      return {
        errorCodes: [SaveErrorCode.Unknown],
      }
    }

    await ctx.authTrx(async (tx) => {
      await ctx.models.articleSavingRequest.update(
        savingRequest.id,
        {
          elasticPageId: pageId,
          status: ArticleSavingRequestStatus.Succeeded,
        },
        tx
      )
    })
  }

  return {
    clientRequestId: input.clientRequestId,
    url: `${homePageURL()}/${saver.profile.username}/links/${
      input.clientRequestId
    }`,
  }
}
