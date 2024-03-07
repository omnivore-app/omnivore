import { isNil, mergeWith } from 'lodash'
import { Between } from 'typeorm'
import { Filter } from '../../entity/filter'
import { env } from '../../env'
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
  UpdateFilterErrorCode,
  UpdateFilterSuccess,
} from '../../generated/graphql'
import { authTrx } from '../../repository'
import { analytics } from '../../utils/analytics'
import { authorized } from '../../utils/gql-utils'

export const saveFilterResolver = authorized<
  SaveFilterSuccess,
  SaveFilterError,
  MutationSaveFilterArgs
>(async (_, { input }, { authTrx, log, uid }) => {
  try {
    const filter = await authTrx(async (t) => {
      return t.getRepository(Filter).save({
        user: { id: uid },
        name: input.name,
        folder: input.folder ?? 'inbox',
        description: '',
        position: input.position ?? 0,
        filter: input.filter,
        defaultFilter: false,
        visible: true,
        category: input.category ?? 'Search',
      })
    })

    return {
      filter,
    }
  } catch (error) {
    log.error('Error saving filters', error)

    return {
      errorCodes: [SaveFilterErrorCode.BadRequest],
    }
  }
})

export const deleteFilterResolver = authorized<
  DeleteFilterSuccess,
  DeleteFilterError,
  MutationDeleteFilterArgs
>(async (_, { id }, { authTrx, log }) => {
  try {
    const filter = await authTrx(async (t) => {
      const repo = t.getRepository(Filter)
      const filter = await repo.findOneByOrFail({
        id,
      })

      await repo.delete(filter.id)
      return filter
    })

    return {
      filter,
    }
  } catch (error) {
    log.error('Error deleting filters', error)

    return {
      errorCodes: [DeleteFilterErrorCode.BadRequest],
    }
  }
})

export const filtersResolver = authorized<FiltersSuccess, FiltersError>(
  async (_, __, { authTrx, uid, log }) => {
    try {
      const filters = await authTrx((t) =>
        t.getRepository(Filter).find({
          where: { user: { id: uid } },
          order: { position: 'ASC' },
        })
      )

      return {
        filters,
      }
    } catch (error) {
      log.error('Error getting filters', error)

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
  const updated = await authTrx(async (t) => {
    const repo = t.getRepository(Filter)
    // update the position of the other filters
    const updated = await repo.update(
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
    return repo.save({
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
>(async (_, { input }, { authTrx, log, uid }) => {
  const { id } = input

  try {
    const filter = await authTrx((t) =>
      t.getRepository(Filter).findOneBy({ id })
    )
    if (!filter) {
      return {
        __typename: 'UpdateFilterError',
        errorCodes: [UpdateFilterErrorCode.NotFound],
      }
    }

    if (!isNil(input.position) && filter.position != input.position) {
      await updatePosition(uid, filter, input.position)
    }

    const updated = await authTrx((t) =>
      t.getRepository(Filter).save({
        ...mergeWith({}, filter, input, (a: unknown, b: unknown) =>
          isNil(b) ? a : undefined
        ),
      })
    )

    return {
      __typename: 'UpdateFilterSuccess',
      filter: updated,
    }
  } catch (error) {
    log.error('Error Updating filters', error)

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
>(async (_, { input }, { authTrx, uid, log }) => {
  const { filterId, afterFilterId } = input

  try {
    const filter = await authTrx((t) =>
      t.getRepository(Filter).findOneBy({
        id: filterId,
      })
    )
    if (!filter) {
      return {
        errorCodes: [MoveFilterErrorCode.NotFound],
      }
    }

    if (filter.id === afterFilterId) {
      // nothing to do
      return { filter }
    }

    // if afterFilterId is not provided, move to the top
    let newPosition = 0
    if (afterFilterId) {
      const afterFilter = await authTrx((t) =>
        t.getRepository(Filter).findOneBy({
          id: afterFilterId,
        })
      )
      if (!afterFilter) {
        return {
          errorCodes: [MoveFilterErrorCode.NotFound],
        }
      }

      newPosition = afterFilter.position
    }
    const updated = await updatePosition(uid, filter, newPosition)

    if (!updated) {
      return {
        errorCodes: [MoveFilterErrorCode.BadRequest],
      }
    }

    analytics.capture({
      distinctId: uid,
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
    log.error('Error moving filters', error)

    return {
      errorCodes: [MoveFilterErrorCode.BadRequest],
    }
  }
})
