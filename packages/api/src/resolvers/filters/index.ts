import { authorized } from '../../utils/helpers'
import {
  DeleteFilterError,
  DeleteFilterErrorCode,
  DeleteFilterSuccess,
  FiltersError,
  FiltersErrorCode,
  FiltersSuccess,
  MutationDeleteFilterArgs,
  MutationSaveFilterArgs,
  SaveFilterError,
  SaveFilterErrorCode,
  SaveFilterSuccess,
} from '../../generated/graphql'
import { Filter } from '../../entity/filter'
import { getRepository } from '../../entity/utils'
import { User } from '../../entity/user'

export const saveFilterResolver = authorized<
  SaveFilterSuccess,
  SaveFilterError,
  MutationSaveFilterArgs
>(async (_, { input }, { claims, log }) => {
  log.info('Saving filters', {
    input,
    labels: {
      source: 'resolver',
      resolver: 'saveFilterResolver',
      uid: claims.uid,
    },
  })

  try {
    const user = await getRepository(User).findOneBy({ id: claims.uid })
    if (!user) {
      return {
        errorCodes: [SaveFilterErrorCode.Unauthorized],
      }
    }

    const filter = await getRepository(Filter).save({
      ...input,
      id: input.id ?? undefined,
      user: { id: claims.uid },
    })

    return {
      filter,
    }
  } catch (error) {
    log.error('Error saving filters', {
      error,
      labels: {
        source: 'resolver',
        resolver: 'saveFilterResolver',
        uid: claims.uid,
      },
    })

    return {
      errorCodes: [SaveFilterErrorCode.BadRequest],
    }
  }
})

export const deleteFilterResolver = authorized<
  DeleteFilterSuccess,
  DeleteFilterError,
  MutationDeleteFilterArgs
>(async (_, { id }, { claims, log }) => {
  log.info('Deleting filters', {
    id,
    labels: {
      source: 'resolver',
      resolver: 'deleteFilterResolver',
      uid: claims.uid,
    },
  })

  try {
    const user = await getRepository(User).findOneBy({ id: claims.uid })
    if (!user) {
      return {
        errorCodes: [DeleteFilterErrorCode.Unauthorized],
      }
    }

    const filter = await getRepository(Filter).findOneBy({
      id,
      user: { id: claims.uid },
    })
    if (!filter) {
      return {
        errorCodes: [DeleteFilterErrorCode.NotFound],
      }
    }

    await getRepository(Filter).delete({ id })

    return {
      filter,
    }
  } catch (error) {
    log.error('Error deleting filters', {
      error,
      labels: {
        source: 'resolver',
        resolver: 'deleteFilterResolver',
        uid: claims.uid,
      },
    })

    return {
      errorCodes: [DeleteFilterErrorCode.BadRequest],
    }
  }
})

export const filtersResolver = authorized<FiltersSuccess, FiltersError>(
  async (_, __, { claims, log }) => {
    log.info('Getting filters', {
      labels: {
        source: 'resolver',
        resolver: 'filtersResolver',
        uid: claims.uid,
      },
    })

    try {
      const user = await getRepository(User).findOneBy({ id: claims.uid })
      if (!user) {
        return {
          errorCodes: [FiltersErrorCode.Unauthorized],
        }
      }

      const filters = await getRepository(Filter).findBy({
        user: { id: claims.uid },
      })

      return {
        filters,
      }
    } catch (error) {
      log.error('Error getting filters', {
        error,
        labels: {
          source: 'resolver',
          resolver: 'filtersResolver',
          uid: claims.uid,
        },
      })

      return {
        errorCodes: [FiltersErrorCode.BadRequest],
      }
    }
  }
)
