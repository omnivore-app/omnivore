import { Link } from '../entity/link'
import { setClaims } from '../entity/utils'
import { AppDataSource } from '../server'

export const setLinkArchived = async (
  userId: string,
  linkId: string,
  archived: boolean
): Promise<void> => {
  await AppDataSource.transaction(async (t) => {
    await setClaims(t, userId)
    await t.getRepository(Link).update(
      {
        id: linkId,
      },
      { archivedAt: archived ? new Date() : null }
    )
  })
}
