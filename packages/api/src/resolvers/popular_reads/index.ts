import {
  AddPopularReadError,
  AddPopularReadErrorCode,
  AddPopularReadSuccess,
  MutationAddPopularReadArgs,
} from '../../generated/graphql'
import { addPopularRead } from '../../services/popular_reads'
import { authorized } from '../../utils/gql-utils'
export const addPopularReadResolver = authorized<
  AddPopularReadSuccess,
  AddPopularReadError,
  MutationAddPopularReadArgs
>(async (_, { name }, { uid }) => {
  const items = await addPopularRead(uid, name)
  if (items.length === 0) {
    return { errorCodes: [AddPopularReadErrorCode.NotFound] }
  }

  return {
    pageId: items[0].id,
  }
})
