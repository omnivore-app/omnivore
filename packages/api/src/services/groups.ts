import { nanoid } from 'nanoid'
import { appDataSource } from '../data_source'
import { Group } from '../entity/groups/group'
import { GroupMembership } from '../entity/groups/group_membership'
import { Invite } from '../entity/groups/invite'
import { RuleActionType } from '../entity/rule'
import { User } from '../entity/user'
import { homePageURL } from '../env'
import { getRepository } from '../repository'
import { PartialRecommendationGroup } from '../resolvers'
import { findOrCreateLabels } from './labels'
import { createRule } from './rules'

export const createGroup = async (input: {
  admin: User
  name: string
  maxMembers?: number | null
  expiresInDays?: number | null
  description?: string | null
  topics?: string[] | null
  onlyAdminCanPost?: boolean | null
  onlyAdminCanSeeMembers?: boolean | null
}): Promise<[Group, Invite]> => {
  const [group, invite] = await appDataSource.transaction<[Group, Invite]>(
    async (t) => {
      // Max number of groups a user can create
      const maxGroups = 3
      const groupCount = await t.getRepository(Group).countBy({
        createdBy: { id: input.admin.id },
      })
      if (groupCount >= maxGroups) {
        throw new Error('Max groups reached')
      }

      const group = await t.getRepository(Group).save({
        name: input.name,
        createdBy: input.admin,
        description: input.description,
        topics: input.topics?.join(','),
        onlyAdminCanPost: input.onlyAdminCanPost ?? false,
        onlyAdminCanSeeMembers: input.onlyAdminCanSeeMembers ?? false,
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
): Promise<Array<PartialRecommendationGroup>> => {
  const groupMembers = await getRepository(GroupMembership).find({
    where: { user: { id: user.id } },
    relations: ['invite', 'group.members.user.profile'],
  })

  return groupMembers.map((gm) => {
    const admins: Array<User> = []
    const members: Array<User> = []
    // Return all members
    gm.group.members.forEach((m) => {
      if (m.isAdmin) {
        admins.push(m.user)
      }
      members.push(m.user)
    })

    const canSeeMembers = gm.group.onlyAdminCanSeeMembers ? gm.isAdmin : true

    return {
      id: gm.group.id,
      name: gm.group.name,
      createdAt: gm.group.createdAt,
      updatedAt: gm.group.updatedAt,
      inviteUrl: getInviteUrl(gm.invite),
      admins,
      members: canSeeMembers ? members : [],
      topics: gm.group.topics?.split(','),
      description: gm.group.description,
      canPost: gm.group.onlyAdminCanPost ? gm.isAdmin : true,
      canSeeMembers,
    }
  })
}

export const getInviteUrl = (invite: Invite) => {
  return `${homePageURL()}/invite/${invite.code}`
}

export const joinGroup = async (
  user: User,
  inviteCode: string
): Promise<PartialRecommendationGroup> => {
  const invite = await appDataSource.transaction<Invite>(async (t) => {
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
      `insert into omnivore.group_membership (user_id, group_id, invite_id)
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
  const admins: Array<User> = []
  const members: Array<User> = []
  // Return all members
  group.members.forEach((m) => {
    if (m.isAdmin) {
      admins.push(m.user)
    }
    members.push(m.user)
  })

  return {
    ...group,
    inviteUrl: getInviteUrl(invite),
    admins,
    members: group.onlyAdminCanSeeMembers ? [] : members,
    topics: group.topics?.split(','),
    description: group.description,
    canPost: !group.onlyAdminCanPost,
    canSeeMembers: !group.onlyAdminCanSeeMembers,
  }
}

export const leaveGroup = async (
  user: User,
  groupId: string
): Promise<boolean> => {
  return appDataSource.transaction(async (t) => {
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

    await t.getRepository(GroupMembership).delete(membership.id)

    if (group.members.length === 1) {
      // delete the group if there are no more members
      await t.getRepository(Group).delete(group.id)

      return true
    }

    if (membership.isAdmin) {
      // If the user is the only admin, we need to promote another user to admin
      const hasAdmin = group.members.some(
        (m) => m.isAdmin && m.id !== membership.id
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

export const createLabelAndRuleForGroup = async (
  userId: string,
  groupName: string
) => {
  const labels = await findOrCreateLabels([{ name: groupName }], userId)

  // create a rule to add the label to all pages in the group
  const addLabelPromise = createRule(userId, {
    name: `Add label ${groupName} to all pages in group ${groupName}`,
    actions: [
      {
        type: RuleActionType.AddLabel,
        params: [labels[0].id],
      },
    ],
    // always add the label to pages in the group
    filter: `recommendedBy:"${groupName}"`,
  })

  // create a rule to send a notification when a page is recommended
  const sendNotificationPromise = createRule(userId, {
    name: `Send notification when a page is recommended to ${groupName}`,
    actions: [
      {
        type: RuleActionType.SendNotification,
        params: [
          `
            {
              "title": "New page recommended in ${groupName}",
              "body": "A new page was added to the group ${groupName}"
            }
          `,
        ],
      },
    ],
    // add a condition to check if the page is created
    filter: `recommendedBy:"${groupName}"`,
  })

  await Promise.all([addLabelPromise, sendNotificationPromise])
}

// find groups where id is in the groupIds and the user is a member of the group and the user is allowed to post
export const getGroupsWhereUserCanPost = async (
  userId: string,
  groupIds: string[]
): Promise<Group[]> => {
  return getRepository(Group)
    .createQueryBuilder('group')
    .innerJoin('group.members', 'members1')
    .whereInIds(groupIds)
    .andWhere('members1.user_id = :userId', { userId })
    .andWhere('(members1.is_admin = true OR group.only_admin_can_post = false)')
    .innerJoinAndSelect('group.members', 'members')
    .innerJoinAndSelect('members.user', 'user')
    .getMany()
}

export const deleteGroup = async (groupId: string) => {
  return getRepository(Group).delete(groupId)
}
