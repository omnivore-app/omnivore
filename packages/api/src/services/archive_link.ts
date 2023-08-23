import { AppDataSource } from '../data-source'
import { Link } from '../entity/link'
import { setClaims } from '../repository'

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
