import { getManager } from 'typeorm'
import { User } from '../entity/user'
import { Group } from '../entity/groups/group'
import { Invite } from '../entity/groups/invite'
import { GroupMembership } from '../entity/groups/group_membership'
import { nanoid } from 'nanoid'

export const createGroup = async (input: {
  admin: User
  name: string
  maxMembers?: number
  expiresInDays?: number
}): Promise<[Group, Invite]> => {
  const [group, invite] = await getManager().transaction<[Group, Invite]>(
    async (t) => {
      const group = await t
        .getRepository(Group)
        .create({
          name: input.name,
          createdBy: input.admin,
        })
        .save()

      const code = nanoid(8)
      const expirationTime = (() => {
        const r = new Date()
        r.setDate(r.getDate() + (input.expiresInDays || 7))
        return r
      })()
      const invite = await t
        .getRepository(Invite)
        .create({
          group,
          code,
          createdBy: input.admin,
          maxMembers: input.maxMembers || 50,
          expirationTime: expirationTime,
        })
        .save()
      // Add the admin to the group as its first user
      await t
        .getRepository(GroupMembership)
        .create({
          user: input.admin,
          group,
          invite,
        })
        .save()
      return [group, invite]
    }
  )
  return [group, invite]
}
