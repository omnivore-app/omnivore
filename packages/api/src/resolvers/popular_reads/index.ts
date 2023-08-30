import {
  AddPopularReadError,
  AddPopularReadErrorCode,
  AddPopularReadSuccess,
  MutationAddPopularReadArgs,
} from '../../generated/graphql'
import { userRepository } from '../../repository'
import { addPopularRead } from '../../services/popular_reads'
import { authorized } from '../../utils/helpers'
export const addPopularReadResolver = authorized<
  AddPopularReadSuccess,
  AddPopularReadError,
  MutationAddPopularReadArgs
>(async (_, { name }, { uid }) => {
  const user = await userRepository.findOneBy({
    id: uid,
  })
  if (!user) {
    return { errorCodes: [AddPopularReadErrorCode.Unauthorized] }
  }

  const pageId = await addPopularRead(uid, name)
  if (!pageId) {
    return { errorCodes: [AddPopularReadErrorCode.NotFound] }
  }

  return {
    pageId,
  }
})
