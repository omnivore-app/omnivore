import {
  GetUserPersonalizationResult,
  GetUserPersonalizationError,
  SetUserPersonalizationSuccess,
  SetUserPersonalizationError,
  MutationSetUserPersonalizationArgs,
  SortOrder,
} from '../../generated/graphql'
import { authorized } from '../../utils/helpers'

export const setUserPersonalizationResolver = authorized<
  SetUserPersonalizationSuccess,
  SetUserPersonalizationError,
  MutationSetUserPersonalizationArgs
>(async (_, { input }, { models, authTrx, claims: { uid } }) => {
  const updatedUserPersonalization = await authTrx((tx) =>
    models.userPersonalization.upsert(
      {
        userId: uid,
        ...input,
      },
      tx
    )
  )

  // Cast SortOrder from string to enum
  const librarySortOrder = updatedUserPersonalization?.librarySortOrder as
    | SortOrder
    | null
    | undefined

  return {
    updatedUserPersonalization: {
      ...updatedUserPersonalization,
      librarySortOrder,
    },
  }
})

export const getUserPersonalizationResolver = authorized<
  GetUserPersonalizationResult,
  GetUserPersonalizationError
>(async (_parent, _args, { models, claims: { uid } }) => {
  const userPersonalization = await models.userPersonalization.getByUserId(uid)

  // Cast SortOrder from string to enum
  const librarySortOrder = userPersonalization?.librarySortOrder as
    | SortOrder
    | null
    | undefined

  return { userPersonalization: { ...userPersonalization, librarySortOrder } }
})
