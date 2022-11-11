import {
  GetUserPersonalizationError,
  GetUserPersonalizationResult,
  MutationSetUserPersonalizationArgs,
  SetUserPersonalizationError,
  SetUserPersonalizationErrorCode,
  SetUserPersonalizationSuccess,
  SortOrder,
} from '../../generated/graphql'
import { authorized } from '../../utils/helpers'
import { UserPersonalization } from '../../entity/user_personalization'
import { AppDataSource } from '../../server'
import { getRepository, setClaims } from '../../entity/utils'

export const setUserPersonalizationResolver = authorized<
  SetUserPersonalizationSuccess,
  SetUserPersonalizationError,
  MutationSetUserPersonalizationArgs
>(async (_, { input }, { claims: { uid }, log }) => {
  log.info('setUserPersonalizationResolver', { uid, input })

  const result = await AppDataSource.transaction(async (entityManager) => {
    await setClaims(entityManager, uid)

    return entityManager.getRepository(UserPersonalization).upsert(
      {
        user: { id: uid },
        ...input,
      },
      ['user']
    )
  })

  if (result.identifiers.length === 0) {
    return {
      errorCodes: [SetUserPersonalizationErrorCode.NotFound],
    }
  }

  const updatedUserPersonalization = await getRepository(
    UserPersonalization
  ).findOneBy({ id: result.identifiers[0].id as string })

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
