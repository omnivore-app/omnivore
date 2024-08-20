import { FindOptionsWhere } from 'typeorm'
import { ApiKey } from '../entity/api_key'
import { authTrx } from '../repository'

export const findApiKeys = async (
  userId: string,
  where?: FindOptionsWhere<ApiKey>[] | FindOptionsWhere<ApiKey>,
  select?: (keyof ApiKey)[]
) => {
  return authTrx(
    (t) =>
      t.getRepository(ApiKey).find({
        select: select || [
          'id',
          'name',
          'scopes',
          'expiresAt',
          'createdAt',
          'usedAt',
        ],
        where: {
          ...where,
          user: { id: userId },
        },
        order: {
          usedAt: { direction: 'DESC', nulls: 'last' },
          createdAt: 'DESC',
        },
      }),
    {
      uid: userId,
    }
  )
}

export const deleteApiKey = async (
  criteria: string[] | FindOptionsWhere<ApiKey>,
  userId: string
) => {
  return authTrx(async (t) => t.getRepository(ApiKey).delete(criteria), {
    uid: userId,
  })
}
