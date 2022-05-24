import {
  UpdatePageError,
  UpdatePageErrorCode,
  UpdatePageSuccess,
  MutationUpdatePageArgs,
} from '../../generated/graphql'
import { authorized, userDataToUser } from '../../utils/helpers'
import { updatePage, getPageById } from '../../elastic/pages'
import { Page } from '../../entity/page'
import { Merge } from '../../util'

export type UpdatePageSuccessPartial = Merge<
  UpdatePageSuccess,
  { updatedPage: Partial<Page> }
>

export const updatePageResolver = authorized<
  UpdatePageSuccessPartial,
  UpdatePageError,
  MutationUpdatePageArgs
>(async (_, { input }, ctx) => {
  const {
    models,
    claims: { uid },
  } = ctx

  const user = userDataToUser(await models.user.get(uid))
  if (!user) {
    return { errorCodes: [UpdatePageErrorCode.Unauthorized] }
  }

  const page = await getPageById(input.pageId)

  if (!page) return { errorCodes: [UpdatePageErrorCode.NotFound] }
  else if (page.userId !== user.id)
    return { errorCodes: [UpdatePageErrorCode.Unauthorized] }

  const pageData = {
    id: input.pageId,
    title: input.title || undefined,
    description: input.description || '',
  }

  const updateResult = await updatePage(input.pageId, pageData, { ...ctx, uid })
  if (!updateResult) return { errorCodes: [UpdatePageErrorCode.UpdateFailed] }

  const updatedPage = (await getPageById(input.pageId)) as unknown as Page
  return {
    updatedPage: updatedPage,
    __typename: 'UpdatePageSuccess',
  }
})
