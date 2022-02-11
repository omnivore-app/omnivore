import { getManager } from 'typeorm'
import { Link } from '../entity/link'
import { setClaims } from '../entity/utils'

export const setLinkArchived = async (
  userId: string,
  linkId: string,
  archived: boolean
): Promise<void> => {
  await getManager().transaction(async (t) => {
    await setClaims(t, userId)
    await t.getRepository(Link).update(
      {
        id: linkId,
      },
      { archivedAt: archived ? new Date() : null }
    )
  })
}
