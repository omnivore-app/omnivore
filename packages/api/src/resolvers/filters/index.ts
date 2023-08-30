import { authorized } from '../../utils/helpers'
import {
  DeleteFilterError,
  DeleteFilterErrorCode,
  DeleteFilterSuccess,
  FiltersError,
  FiltersErrorCode,
  FiltersSuccess,
  MoveFilterError,
  MoveFilterErrorCode,
  MoveFilterSuccess,
  MutationDeleteFilterArgs,
  MutationMoveFilterArgs,
  MutationSaveFilterArgs,
  MutationUpdateFilterArgs,
  SaveFilterError,
  SaveFilterErrorCode,
  SaveFilterSuccess,
  UpdateFilterError,
  UpdateFilterSuccess,
  UpdateFilterErrorCode,
} from '../../generated/graphql'
import { Filter } from '../../entity/filter'
import { getRepository, setClaims } from '../../entity/utils'
import { User } from '../../entity/user'
import { AppDataSource } from '../../server'
import { Between } from 'typeorm'
import { analytics } from '../../utils/analytics'
import { env } from '../../env'
import { isNil, mergeWith } from 'lodash'

export const saveFilterResolver = authorized<
  SaveFilterSuccess,
  SaveFilterError,
  MutationSaveFilterArgs
>(async (_, { input }, { claims: { uid }, log }) => {
  log.info('Saving filters', {
    input,
    labels: {
      source: 'resolver',
      resolver: 'saveFilterResolver',
      uid,
    },
  })

  try {
    const user = await getRepository(User).findOneBy({ id: uid })
    if (!user) {
      return {
        errorCodes: [SaveFilterErrorCode.Unauthorized],
      }
    }

    const filter = await getRepository(Filter).save({
      user: { id: uid },
      name: input.name,
      category: 'Search',
      description: '',
      position: input.position ?? 0,
      filter: input.filter,
      defaultFilter: false,
      visible: true,
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
        uid,
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

      const filters = await getRepository(Filter).find({
        where: { user: { id: claims.uid } },
        order: { position: 'ASC' },
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
const updatePosition = async (
  uid: string,
  filter: Filter,
  newPosition: number
) => {
  const { position } = filter
  const moveUp = newPosition < position

  // move filter to the new position
  const updated = await AppDataSource.transaction(async (t) => {
    await setClaims(t, uid)

    // update the position of the other filters
    const updated = await t.getRepository(Filter).update(
      {
        user: { id: uid },
        position: Between(
          Math.min(newPosition, position),
          Math.max(newPosition, position)
        ),
      },
      {
        position: () => `position + ${moveUp ? 1 : -1}`,
      }
    )

    if (!updated.affected) {
      return null
    }

    // update the position of the filter
    return t.getRepository(Filter).save({
      ...filter,
      position: newPosition,
    })
  })

  if (!updated) {
    throw new Error('unable to update')
  }

  return updated
}

export const updateFilterResolver = authorized<
  UpdateFilterSuccess,
  UpdateFilterError,
  MutationUpdateFilterArgs
>(async (_, { input }, { claims: { uid }, log }) => {
  const repo = getRepository(Filter)
  const { id } = input

  try {
    const user = await getRepository(User).findOneBy({ id: uid })
    if (!user) {
      return {
        errorCodes: [UpdateFilterErrorCode.Unauthorized],
      }
    }

    const filter = await getRepository(Filter).findOne({
      where: { id },
      relations: ['user'],
    })
    if (!filter) {
      return {
        __typename: 'UpdateFilterError',
        errorCodes: [UpdateFilterErrorCode.NotFound],
      }
    }
    if (filter.user.id !== uid) {
      return {
        __typename: 'UpdateFilterError',
        errorCodes: [UpdateFilterErrorCode.Unauthorized],
      }
    }

    if (input.position && filter.position != input.position) {
      await updatePosition(uid, filter, input.position)
    }

    const updated = await repo.save({
      ...mergeWith({}, filter, input, (a: unknown, b: unknown) =>
        isNil(b) ? a : undefined
      ),
    })

    return {
      __typename: 'UpdateFilterSuccess',
      filter: updated,
    }
  } catch (error) {
    log.error('Error Updating filters', {
      error,
      labels: {
        source: 'resolver',
        resolver: 'UpdateFilterResolver',
        uid,
      },
    })

    return {
      __typename: 'UpdateFilterError',
      errorCodes: [UpdateFilterErrorCode.BadRequest],
    }
  }
})

export const moveFilterResolver = authorized<
  MoveFilterSuccess,
  MoveFilterError,
  MutationMoveFilterArgs
>(async (_, { input }, { claims: { uid }, log }) => {
  log.info('Moving filters', {
    input,
    filters: {
      source: 'resolver',
      resolver: 'moveFilterResolver',
      uid,
    },
  })

  const { filterId, afterFilterId } = input

  try {
    const user = await getRepository(User).findOneBy({ id: uid })
    if (!user) {
      return {
        errorCodes: [MoveFilterErrorCode.Unauthorized],
      }
    }

    const filter = await getRepository(Filter).findOne({
      where: { id: filterId },
      relations: ['user'],
    })
    if (!filter) {
      return {
        errorCodes: [MoveFilterErrorCode.NotFound],
      }
    }
    if (filter.user.id !== uid) {
      return {
        errorCodes: [MoveFilterErrorCode.Unauthorized],
      }
    }

    if (filter.id === afterFilterId) {
      // nothing to do
      return { filter }
    }

    const oldPosition = filter.position
    // if afterFilterId is not provided, move to the top
    let newPosition = 1
    if (afterFilterId) {
      const afterFilter = await getRepository(Filter).findOne({
        where: { id: afterFilterId },
        relations: ['user'],
      })
      if (!afterFilter) {
        return {
          errorCodes: [MoveFilterErrorCode.NotFound],
        }
      }
      if (afterFilter.user.id !== uid) {
        return {
          errorCodes: [MoveFilterErrorCode.Unauthorized],
        }
      }
      newPosition = afterFilter.position
    }
    const moveUp = newPosition < oldPosition

    // move filter to the new position
    const updated = await AppDataSource.transaction(async (t) => {
      await setClaims(t, uid)

      // update the position of the other filters
      const updated = await t.getRepository(Filter).update(
        {
          user: { id: uid },
          position: Between(
            Math.min(newPosition, oldPosition),
            Math.max(newPosition, oldPosition)
          ),
        },
        {
          position: () => `position + ${moveUp ? 1 : -1}`,
        }
      )
      if (!updated.affected) {
        return null
      }

      // update the position of the filter
      return t.getRepository(Filter).save({
        ...filter,
        position: newPosition,
      })
    })

    if (!updated) {
      return {
        errorCodes: [MoveFilterErrorCode.BadRequest],
      }
    }

    analytics.track({
      userId: uid,
      event: 'filter_moved',
      properties: {
        filterId,
        afterFilterId,
        env: env.server.apiEnv,
      },
    })

    return {
      filter: updated,
    }
  } catch (error) {
    log.error('Error moving filters', {
      error,
      labels: {
        source: 'resolver',
        resolver: 'moveFilterResolver',
        uid,
      },
    })

    return {
      errorCodes: [MoveFilterErrorCode.BadRequest],
    }
  }
})
