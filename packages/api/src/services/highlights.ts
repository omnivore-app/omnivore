import { ExpressionToken, LiqeQuery } from '@omnivore/liqe'
import { diff_match_patch } from 'diff-match-patch'
import { DeepPartial, In, ObjectLiteral } from 'typeorm'
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity'
import { EntityLabel } from '../entity/entity_label'
import { Highlight } from '../entity/highlight'
import { Label } from '../entity/label'
import { homePageURL } from '../env'
import { createPubSubClient, EntityEvent, EntityType } from '../pubsub'
import { authTrx, paramtersToObject } from '../repository'
import { highlightRepository } from '../repository/highlight'
import { Merge } from '../util'
import { enqueueUpdateHighlight } from '../utils/createTask'
import { deepDelete } from '../utils/helpers'
import { parseSearchQuery } from '../utils/search'
import { ItemEvent } from './library_item'

const columnsToDelete = ['user', 'sharedAt', 'libraryItem'] as const
type ColumnsToDeleteType = typeof columnsToDelete[number]
export type HighlightEvent = Merge<
  Omit<DeepPartial<Highlight>, ColumnsToDeleteType>,
  EntityEvent
>

export const batchGetHighlightsFromLibraryItemIds = async (
  libraryItemIds: readonly string[]
): Promise<Highlight[][]> => {
  const highlights = await authTrx(async (tx) =>
    tx.getRepository(Highlight).find({
      where: { libraryItem: { id: In(libraryItemIds as string[]) } },
      relations: ['user'],
    })
  )

  return libraryItemIds.map((libraryItemId) =>
    highlights.filter((highlight) => highlight.libraryItemId === libraryItemId)
  )
}

export const getHighlightLocation = (patch: string): number | undefined => {
  const dmp = new diff_match_patch()
  const patches = dmp.patch_fromText(patch)
  return patches[0].start1 || undefined
}

export const getHighlightUrl = (slug: string, highlightId: string): string =>
  `${homePageURL()}/me/${slug}#${highlightId}`

export const createHighlights = async (
  highlights: DeepPartial<Highlight>[],
  userId: string
) => {
  return authTrx(
    async (tx) =>
      tx.withRepository(highlightRepository).createAndSaves(highlights),
    undefined,
    userId
  )
}

export const createHighlight = async (
  highlight: DeepPartial<Highlight>,
  libraryItemId: string,
  userId: string,
  pubsub = createPubSubClient()
) => {
  const newHighlight = await authTrx(
    async (tx) => {
      const repo = tx.withRepository(highlightRepository)
      const newHighlight = await repo.createAndSave(highlight)
      return repo.findOneOrFail({
        where: { id: newHighlight.id },
        relations: {
          user: true,
          libraryItem: true,
        },
      })
    },
    undefined,
    userId
  )

  const data = deepDelete(newHighlight, columnsToDelete)
  await pubsub.entityCreated<ItemEvent>(
    EntityType.HIGHLIGHT,
    {
      id: libraryItemId,
      highlights: [data],
      // for Readwise
      originalUrl: newHighlight.libraryItem.originalUrl,
      title: newHighlight.libraryItem.title,
      author: newHighlight.libraryItem.author,
      thumbnail: newHighlight.libraryItem.thumbnail,
    },
    userId
  )

  await enqueueUpdateHighlight({
    libraryItemId,
    userId,
  })

  return newHighlight
}

export const mergeHighlights = async (
  highlightsToRemove: string[],
  highlightToAdd: DeepPartial<Highlight>,
  labels: Label[],
  libraryItemId: string,
  userId: string,
  pubsub = createPubSubClient()
) => {
  const newHighlight = await authTrx(async (tx) => {
    const highlightRepo = tx.withRepository(highlightRepository)

    await highlightRepo.delete(highlightsToRemove)

    const newHighlight = await highlightRepo.createAndSave(highlightToAdd)

    if (labels.length > 0) {
      // save new labels
      await tx.getRepository(EntityLabel).save(
        labels.map((l) => ({
          labelId: l.id,
          highlightId: newHighlight.id,
        }))
      )
    }

    return highlightRepo.findOneOrFail({
      where: { id: newHighlight.id },
      relations: {
        user: true,
        libraryItem: true,
      },
    })
  })

  await pubsub.entityCreated<ItemEvent>(
    EntityType.HIGHLIGHT,
    {
      id: libraryItemId,
      originalUrl: newHighlight.libraryItem.originalUrl,
      title: newHighlight.libraryItem.title,
      author: newHighlight.libraryItem.author,
      thumbnail: newHighlight.libraryItem.thumbnail,
      highlights: [newHighlight],
    },
    userId
  )

  await enqueueUpdateHighlight({
    libraryItemId,
    userId,
  })

  return newHighlight
}

export const updateHighlight = async (
  highlightId: string,
  highlight: QueryDeepPartialEntity<Highlight>,
  userId: string,
  pubsub = createPubSubClient()
) => {
  const updatedHighlight = await authTrx(async (tx) => {
    const highlightRepo = tx.withRepository(highlightRepository)
    await highlightRepo.updateAndSave(highlightId, highlight)

    return highlightRepo.findOneOrFail({
      where: { id: highlightId },
      relations: {
        libraryItem: true,
        user: true,
      },
    })
  })

  const libraryItemId = updatedHighlight.libraryItem.id
  await pubsub.entityUpdated<ItemEvent>(
    EntityType.HIGHLIGHT,
    {
      id: libraryItemId,
      originalUrl: updatedHighlight.libraryItem.originalUrl,
      title: updatedHighlight.libraryItem.title,
      author: updatedHighlight.libraryItem.author,
      thumbnail: updatedHighlight.libraryItem.thumbnail,
      highlights: [
        {
          ...highlight,
          id: highlightId,
          updatedAt: new Date(),
          quote: updatedHighlight.quote,
          highlightType: updatedHighlight.highlightType,
        },
      ],
    } as ItemEvent,
    userId
  )

  await enqueueUpdateHighlight({
    libraryItemId,
    userId,
  })

  return updatedHighlight
}

export const deleteHighlightById = async (
  highlightId: string,
  userId?: string
) => {
  const deletedHighlight = await authTrx(
    async (tx) => {
      const highlightRepo = tx.withRepository(highlightRepository)
      const highlight = await highlightRepo.findOneOrFail({
        where: { id: highlightId },
        relations: {
          user: true,
        },
      })

      await highlightRepo.delete(highlightId)
      return highlight
    },
    undefined,
    userId
  )

  await enqueueUpdateHighlight({
    libraryItemId: deletedHighlight.libraryItemId,
    userId: deletedHighlight.user.id,
  })

  return deletedHighlight
}

export const deleteHighlightsByIds = async (
  userId: string,
  highlightIds: string[]
) => {
  await authTrx(
    async (tx) => tx.getRepository(Highlight).delete(highlightIds),
    undefined,
    userId
  )
}

export const findHighlightById = async (
  highlightId: string,
  userId: string
) => {
  return authTrx(
    async (tx) => {
      const highlightRepo = tx.withRepository(highlightRepository)
      return highlightRepo.findOneBy({
        id: highlightId,
      })
    },
    undefined,
    userId
  )
}

export const findHighlightsByLibraryItemId = async (
  libraryItemId: string,
  userId: string
) => {
  return authTrx(
    async (tx) =>
      tx.withRepository(highlightRepository).find({
        where: { libraryItem: { id: libraryItemId } },
        relations: {
          user: true,
          labels: true,
        },
      }),
    undefined,
    userId
  )
}

export const buildQueryString = (
  searchQuery: LiqeQuery,
  parameters: ObjectLiteral[] = []
) => {
  const escapeQueryWithParameters = (
    query: string,
    parameter: ObjectLiteral
  ) => {
    parameters.push(parameter)
    return query
  }

  const serializeImplicitField = (
    expression: ExpressionToken
  ): string | null => {
    if (expression.type !== 'LiteralExpression') {
      throw new Error('Expected a literal expression')
    }

    // not implemented yet
    return null
  }

  const serializeTagExpression = (ast: LiqeQuery): string | null => {
    if (ast.type !== 'Tag') {
      throw new Error('Expected a tag expression')
    }

    const { field, expression } = ast

    if (field.type === 'ImplicitField') {
      return serializeImplicitField(expression)
    } else {
      if (expression.type !== 'LiteralExpression') {
        // ignore empty values
        return null
      }

      const value = expression.value?.toString()
      if (!value) {
        // ignore empty values
        return null
      }

      switch (field.name.toLowerCase()) {
        case 'label': {
          const labels = value.toLowerCase().split(',')
          return (
            labels
              .map((label) => {
                const param = `label_${parameters.length}`

                const hasWildcard = label.includes('*')
                if (hasWildcard) {
                  return escapeQueryWithParameters(
                    `label.name ILIKE :${param}`,
                    {
                      [param]: label.replace(/\*/g, '%'),
                    }
                  )
                }

                return escapeQueryWithParameters(
                  `LOWER(label.name) = :${param}`,
                  {
                    [param]: label.toLowerCase(),
                  }
                )
              })
              .join(' OR ')
              // wrap in brackets to avoid precedence issues
              .replace(/^(.*)$/, '($1)')
          )
        }
        default:
          // treat unknown fields as implicit fields
          return serializeImplicitField({
            ...expression,
            value: `${field.name}:${value}`,
          })
      }
    }
  }

  const serialize = (ast: LiqeQuery): string | null => {
    if (ast.type === 'Tag') {
      return serializeTagExpression(ast)
    }

    if (ast.type === 'LogicalExpression') {
      let operator = ''
      if (ast.operator.operator === 'AND') {
        operator = 'AND'
      } else if (ast.operator.operator === 'OR') {
        operator = 'OR'
      } else {
        throw new Error('Unexpected operator')
      }

      const left = serialize(ast.left)
      const right = serialize(ast.right)

      if (!left && !right) {
        return null
      }

      if (!left) {
        return right
      }

      if (!right) {
        return left
      }

      return `${left} ${operator} ${right}`
    }

    if (ast.type === 'UnaryOperator') {
      const serialized = serialize(ast.operand)

      if (!serialized) {
        return null
      }

      return `NOT ${serialized}`
    }

    if (ast.type === 'ParenthesizedExpression') {
      const serialized = serialize(ast.expression)

      if (!serialized) {
        return null
      }

      return `(${serialized})`
    }

    return null
  }

  return serialize(searchQuery)
}

export const searchHighlights = async (
  userId: string,
  query?: string,
  limit?: number,
  offset?: number
): Promise<Array<Highlight>> => {
  return authTrx(
    async (tx) => {
      // TODO: parse query and search by it
      const queryBuilder = tx
        .getRepository(Highlight)
        .createQueryBuilder('highlight')

      queryBuilder
        .andWhere('highlight.userId = :userId', { userId })
        .orderBy('highlight.updatedAt', 'DESC')
        .take(limit)
        .skip(offset)

      if (query) {
        const parameters: ObjectLiteral[] = []

        const searchQuery = parseSearchQuery(query)

        // build query string and save parameters
        const queryString = buildQueryString(searchQuery, parameters)

        if (queryString) {
          // add where clause from query string
          queryBuilder
            .innerJoinAndSelect('highlight.labels', 'label')
            .andWhere(`(${queryString})`)
            .setParameters(paramtersToObject(parameters))
        }
      }

      return queryBuilder.getMany()
    },
    undefined,
    userId
  )
}
