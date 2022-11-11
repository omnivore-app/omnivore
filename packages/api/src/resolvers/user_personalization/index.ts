import {
  GetUserPersonalizationError,
  GetUserPersonalizationResult,
  MutationSetUserPersonalizationArgs,
  SetUserPersonalizationError,
  SetUserPersonalizationSuccess,
  SortOrder,
} from '../../generated/graphql'
import { authorized } from '../../utils/helpers'
import { UserPersonalization } from '../../entity/user_personalization'
import { AppDataSource } from '../../server'
import { setClaims } from '../../entity/utils'

export const setUserPersonalizationResolver = authorized<
  SetUserPersonalizationSuccess,
  SetUserPersonalizationError,
  MutationSetUserPersonalizationArgs
>(async (_, { input }, { claims: { uid } }) => {
  const updatedUserPersonalization =
    await AppDataSource.transaction<UserPersonalization>(
      async (entityManager) => {
        await setClaims(entityManager, uid)

        return entityManager.getRepository(UserPersonalization).save({
          user: { id: uid },
          ...input,
        })
      }
    )

  // Cast SortOrder from string to enum
  const librarySortOrder = updatedUserPersonalization.librarySortOrder as
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
