import { getPageById, updatePage } from '../../elastic/pages'
import { Page } from '../../elastic/types'
import {
  MutationUpdatePageArgs,
  UpdatePageError,
  UpdatePageErrorCode,
  UpdatePageSuccess,
} from '../../generated/graphql'
import { Merge } from '../../util'
import { authorized } from '../../utils/helpers'

export type UpdatePageSuccessPartial = Merge<
  UpdatePageSuccess,
  { updatedPage: Partial<Page> }
>

export const updatePageResolver = authorized<
  UpdatePageSuccessPartial,
  UpdatePageError,
  MutationUpdatePageArgs
>(async (_, { input }, ctx) => {
  const { pubsub, uid } = ctx

  const page = await getPageById(input.pageId)

  if (!page) {
    return { errorCodes: [UpdatePageErrorCode.NotFound] }
  }

  const pageData = {
    id: input.pageId,
    title: input.title ?? undefined,
    description: input.description ?? undefined,
    author: input.byline ?? undefined,
    savedAt: input.savedAt ? new Date(input.savedAt) : undefined,
    publishedAt: input.publishedAt ? new Date(input.publishedAt) : undefined,
    image: input.previewImage ?? undefined,
    state: input.state ?? undefined,
  }

  const updateResult = await updatePage(input.pageId, pageData, {
    pubsub: pubsub,
    uid,
    refresh: true,
  })
  if (!updateResult) return { errorCodes: [UpdatePageErrorCode.UpdateFailed] }

  const updatedPage = (await getPageById(input.pageId)) as unknown as Page
  return {
    updatedPage: updatedPage,
    __typename: 'UpdatePageSuccess',
  }
})
