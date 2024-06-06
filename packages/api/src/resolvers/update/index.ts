import { LibraryItem, LibraryItemState } from '../../entity/library_item'
import {
  MutationUpdatePageArgs,
  UpdatePageError,
  UpdatePageSuccess,
} from '../../generated/graphql'
import { updateLibraryItem } from '../../services/library_item'
import { Merge } from '../../util'
import { authorized } from '../../utils/gql-utils'

export const updatePageResolver = authorized<
  Merge<UpdatePageSuccess, { updatedPage: LibraryItem }>,
  UpdatePageError,
  MutationUpdatePageArgs
>(async (_, { input }, { uid }) => {
  const updatedPage = await updateLibraryItem(
    input.pageId,
    {
      title: input.title ?? undefined,
      description: input.description ?? undefined,
      author: input.byline ?? undefined,
      savedAt: input.savedAt ? new Date(input.savedAt) : undefined,
      publishedAt: input.publishedAt ? new Date(input.publishedAt) : undefined,
      thumbnail: input.previewImage ?? undefined,
      state: input.state
        ? (input.state as unknown as LibraryItemState)
        : undefined,
    },
    uid
  )
  return {
    updatedPage: updatedPage,
  }
})
