import {
  AddPopularReadError,
  AddPopularReadErrorCode,
  AddPopularReadSuccess,
  MutationAddPopularReadArgs,
} from '../../generated/graphql'
import { addPopularRead } from '../../services/popular_reads'
import { authorized } from '../../utils/helpers'
export const addPopularReadResolver = authorized<
  AddPopularReadSuccess,
  AddPopularReadError,
  MutationAddPopularReadArgs
>(async (_, { name }, { uid }) => {
  const item = await addPopularRead(uid, name)
  if (!item) {
    return { errorCodes: [AddPopularReadErrorCode.NotFound] }
  }

  return {
    pageId: item.id,
  }
})
