import { UserPersonalization } from '../../entity/user_personalization'
import {
  GetUserPersonalizationError,
  GetUserPersonalizationResult,
  MutationSetUserPersonalizationArgs,
  SetUserPersonalizationError,
  SetUserPersonalizationErrorCode,
  SetUserPersonalizationInput,
  SetUserPersonalizationSuccess,
  SortOrder,
} from '../../generated/graphql'
import { authorized } from '../../utils/gql-utils'

export const setUserPersonalizationResolver = authorized<
  SetUserPersonalizationSuccess,
  SetUserPersonalizationError,
  MutationSetUserPersonalizationArgs
>(async (_, { input }, { authTrx, uid }) => {
  const newValues = input as Omit<SetUserPersonalizationInput, 'digestConfig'>
  const result = await authTrx(async (t) => {
    return t.getRepository(UserPersonalization).upsert(
      {
        user: { id: uid },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        digestConfig: input.digestConfig as any,
        ...newValues,
      },
      ['user']
    )
  })

  if (result.identifiers.length === 0) {
    return {
      errorCodes: [SetUserPersonalizationErrorCode.NotFound],
    }
  }

  const updatedUserPersonalization = await authTrx((t) =>
    t
      .getRepository(UserPersonalization)
      .findOneBy({ id: result.identifiers[0].id as string })
  )

  // Cast SortOrder from string to enum
  const librarySortOrder =
    updatedUserPersonalization?.librarySortOrder as SortOrder

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
>(async (_parent, _args, { authTrx, uid }) => {
  const userPersonalization = await authTrx((t) =>
    t.getRepository(UserPersonalization).findOneBy({
      user: { id: uid },
    })
  )

  // Cast SortOrder from string to enum
  const librarySortOrder = userPersonalization?.librarySortOrder as SortOrder

  return { userPersonalization: { ...userPersonalization, librarySortOrder } }
})
