import { User } from '../entity/user'
import { Group } from '../entity/groups/group'
import { Invite } from '../entity/groups/invite'
import { GroupMembership } from '../entity/groups/group_membership'
import { nanoid } from 'nanoid'
import { AppDataSource } from '../server'

export const createGroup = async (input: {
  admin: User
  name: string
  maxMembers?: number
  expiresInDays?: number
}): Promise<[Group, Invite]> => {
  const [group, invite] = await AppDataSource.transaction<[Group, Invite]>(
    async (t) => {
      const group = await t.getRepository(Group).save({
        name: input.name,
        createdBy: input.admin,
      })

      const code = nanoid(8)
      const expirationTime = (() => {
        const r = new Date()
        r.setDate(r.getDate() + (input.expiresInDays || 7))
        return r
      })()
      const invite = await t.getRepository(Invite).save({
        group,
        code,
        createdBy: input.admin,
        maxMembers: input.maxMembers || 50,
        expirationTime: expirationTime,
      })
      // Add the admin to the group as its first user
      await t.getRepository(GroupMembership).save({
        user: input.admin,
        group,
        invite,
      })
      return [group, invite]
    }
  )
  return [group, invite]
}
