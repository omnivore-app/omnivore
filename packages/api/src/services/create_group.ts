import { User } from '../entity/user'
import { Group } from '../entity/groups/group'
import { Invite } from '../entity/groups/invite'
import { GroupMembership } from '../entity/groups/group_membership'
import { nanoid } from 'nanoid'
import { AppDataSource } from '../server'
import { RecommendationGroup, User as GraphqlUser } from '../generated/graphql'
import { getRepository } from '../entity/utils'
import { homePageURL } from '../env'
import { userDataToUser } from '../utils/helpers'

export const createGroup = async (input: {
  admin: User
  name: string
  maxMembers?: number | null
  expiresInDays?: number | null
}): Promise<[Group, Invite]> => {
  const [group, invite] = await AppDataSource.transaction<[Group, Invite]>(
    async (t) => {
      // Max number of groups a user can create
      const maxGroups = 3
      const groupCount = await getRepository(Group).countBy({
        createdBy: { id: input.admin.id },
      })
      if (groupCount >= maxGroups) {
        throw new Error('Max groups reached')
      }

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
        maxMembers: input.maxMembers || 12,
        expirationTime: expirationTime,
      })
      // Add the admin to the group as its first user
      await t.getRepository(GroupMembership).save({
        user: input.admin,
        group,
        invite,
        isAdmin: true,
      })
      return [group, invite]
    }
  )
  return [group, invite]
}

export const getRecommendationGroups = async (
  user: User
): Promise<RecommendationGroup[]> => {
  const groupMembers = await getRepository(GroupMembership).find({
    where: { user: { id: user.id } },
    relations: ['invite', 'group.members.user.profile'],
  })

  return groupMembers.map((gm) => {
    const admins: GraphqlUser[] = []
    const members: GraphqlUser[] = []
    gm.group.members.forEach((m) => {
      const user = userDataToUser(m.user)
      if (m.isAdmin) {
        admins.push(user)
      }
      members.push(user)
    })

    return {
      id: gm.group.id,
      name: gm.group.name,
      createdAt: gm.group.createdAt,
      updatedAt: gm.group.updatedAt,
      inviteUrl: getInviteUrl(gm.invite),
      admins,
      members,
    }
  })
}

export const getInviteUrl = (invite: Invite) => {
  return `${homePageURL()}/invite/${invite.code}`
}
