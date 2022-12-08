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

export const joinGroup = async (
  user: User,
  inviteCode: string
): Promise<RecommendationGroup> => {
  const invite = await AppDataSource.transaction<Invite>(async (t) => {
    // Check if the invite exists
    const invite = await t
      .getRepository(Invite)
      .createQueryBuilder('invite')
      .setLock('pessimistic_write')
      .innerJoinAndSelect('invite.group', 'group')
      .where('invite.code = :inviteCode AND invite.expiration_time >= NOW()', {
        inviteCode,
      })
      .getOne()

    if (!invite) {
      throw new Error('Invite not found')
    }

    // Check if exceeded max members considering concurrent requests
    await t.query(
      `
insert into omnivore.group_membership (user_id, group_id, invite_id)
select $1, $2, $3
from omnivore.group_membership
where group_id = $2
having count(*) < $4`,
      [user.id, invite.group.id, invite.id, invite.maxMembers]
    )

    return invite
  })

  const group = await getRepository(Group).findOneOrFail({
    where: { id: invite.group.id },
    relations: ['members', 'members.user.profile'],
  })
  const admins: GraphqlUser[] = []
  const members: GraphqlUser[] = []
  group.members.forEach((m) => {
    const user = userDataToUser(m.user)
    if (m.isAdmin) {
      admins.push(user)
    }
    members.push(user)
  })

  return {
    ...group,
    inviteUrl: getInviteUrl(invite),
    admins,
    members,
  }
}

export const leaveGroup = async (
  user: User,
  groupId: string
): Promise<boolean> => {
  return AppDataSource.transaction(async (t) => {
    const group = await t
      .getRepository(Group)
      .createQueryBuilder('group')
      .setLock('pessimistic_write')
      .innerJoinAndSelect('group.members', 'members')
      .where('group.id = :groupId', { groupId })
      .getOne()

    if (!group) {
      throw new Error('Group not found')
    }

    const membership = await t.getRepository(GroupMembership).findOne({
      where: { user: { id: user.id }, group: { id: group.id } },
    })
    if (!membership) {
      throw new Error('User not in group')
    }

    const membershipId = membership.id
    await t.getRepository(GroupMembership).remove(membership)

    if (group.members.length === 1) {
      // delete the group if there are no more members
      await t.getRepository(Group).remove(group)

      return true
    }

    if (membership.isAdmin) {
      // If the user is the only admin, we need to promote another user to admin
      const hasAdmin = group.members.some(
        (m) => m.isAdmin && m.id !== membershipId
      )
      if (!hasAdmin) {
        const newAdmin = group.members.find((m) => !m.isAdmin)
        if (!newAdmin) {
          throw new Error('No user found')
        }

        newAdmin.isAdmin = true
        await t.getRepository(GroupMembership).save(newAdmin)
      }
    }

    return true
  })
}
