import { In } from 'typeorm'
import { Group } from '../../entity/groups/group'
import { User } from '../../entity/user'
import { env } from '../../env'
import {
  CreateGroupError,
  CreateGroupErrorCode,
  CreateGroupSuccess,
  GroupsError,
  GroupsErrorCode,
  GroupsSuccess,
  JoinGroupError,
  JoinGroupErrorCode,
  JoinGroupSuccess,
  LeaveGroupError,
  LeaveGroupErrorCode,
  LeaveGroupSuccess,
  MutationCreateGroupArgs,
  MutationJoinGroupArgs,
  MutationLeaveGroupArgs,
  MutationRecommendArgs,
  MutationRecommendHighlightsArgs,
  RecommendationGroup,
  RecommendError,
  RecommendErrorCode,
  RecommendHighlightsError,
  RecommendHighlightsErrorCode,
  RecommendHighlightsSuccess,
  RecommendSuccess,
} from '../../generated/graphql'
import { getRepository } from '../../repository'
import { userRepository } from '../../repository/user'
import {
  createGroup,
  createLabelAndRuleForGroup,
  getGroupsWhereUserCanPost,
  getInviteUrl,
  getRecommendationGroups,
  joinGroup,
  leaveGroup,
} from '../../services/groups'
import { findLibraryItemById } from '../../services/library_item'
import { Merge } from '../../util'
import { analytics } from '../../utils/analytics'
import { enqueueRecommendation } from '../../utils/createTask'
import { authorized } from '../../utils/gql-utils'

export type PartialRecommendationGroup = Merge<
  RecommendationGroup,
  { admins: Array<User>; members: Array<User> }
>
export const createGroupResolver = authorized<
  Merge<CreateGroupSuccess, { group: PartialRecommendationGroup }>,
  CreateGroupError,
  MutationCreateGroupArgs
>(async (_, { input }, { uid, log }) => {
  try {
    const user = await userRepository.findById(uid)
    if (!user) {
      return {
        errorCodes: [CreateGroupErrorCode.Unauthorized],
      }
    }

    const [group, invite] = await createGroup({
      admin: user,
      name: input.name,
      maxMembers: input.maxMembers,
      expiresInDays: input.expiresInDays,
      description: input.description,
      topics: input.topics,
      onlyAdminCanPost: input.onlyAdminCanPost,
      onlyAdminCanSeeMembers: input.onlyAdminCanSeeMembers,
    })

    analytics.capture({
      distinctId: uid,
      event: 'group_created',
      properties: {
        group_id: group.id,
        group_name: group.name,
        group_invite_code: invite.code,
      },
    })

    await createLabelAndRuleForGroup(uid, group.name)

    const inviteUrl = getInviteUrl(invite)

    return {
      group: {
        ...group,
        inviteUrl,
        admins: [user],
        members: [user],
        canSeeMembers: true,
        canPost: true,
        description: group.description,
        topics: group.topics?.split(','),
      },
    }
  } catch (error) {
    log.error('Error creating group', error)

    return {
      errorCodes: [CreateGroupErrorCode.BadRequest],
    }
  }
})

export const groupsResolver = authorized<
  Merge<GroupsSuccess, { groups: Array<PartialRecommendationGroup> }>,
  GroupsError
>(async (_, __, { uid, log }) => {
  try {
    const user = await userRepository.findById(uid)
    if (!user) {
      return {
        errorCodes: [GroupsErrorCode.Unauthorized],
      }
    }

    const groups = await getRecommendationGroups(user)

    return {
      groups,
    }
  } catch (error) {
    log.error('Error getting groups', {
      error,
      labels: {
        source: 'resolver',
        resolver: 'groupsResolver',
        uid,
      },
    })

    return {
      errorCodes: [GroupsErrorCode.BadRequest],
    }
  }
})

export const recommendResolver = authorized<
  RecommendSuccess,
  RecommendError,
  MutationRecommendArgs
>(async (_, { input }, { uid, log, signToken }) => {
  try {
    const item = await findLibraryItemById(input.pageId, uid, {
      select: ['id'],
      relations: {
        highlights: {
          user: true,
        },
      },
    })
    if (!item) {
      return {
        errorCodes: [RecommendErrorCode.NotFound],
      }
    }

    // find groups where id is in the groupIds and the user is a member of the group and the user is allowed to post
    const groups = await getGroupsWhereUserCanPost(uid, input.groupIds)
    if (groups.length === 0) {
      return {
        errorCodes: [RecommendErrorCode.NotFound],
      }
    }

    // only recommend highlights created by the user
    const recommendedHighlightIds = input.recommendedWithHighlights
      ? item.highlights?.filter((h) => h.user.id === uid)?.map((h) => h.id)
      : undefined

    const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 // 1 day
    const auth = (await signToken({ uid, exp }, env.server.jwtSecret)) as string
    const taskNames = await Promise.all(
      groups
        .map((group) =>
          group.members.map((member) =>
            enqueueRecommendation(
              member.user.id,
              item.id,
              {
                group: { id: group.id, name: group.name },
                note: input.note,
                recommender: { id: uid },
                createdAt: new Date(),
                libraryItem: { id: item.id },
              },
              auth,
              recommendedHighlightIds
            )
          )
        )
        .flat()
    )
    log.info('taskNames', taskNames)

    return {
      success: true,
    }
  } catch (error) {
    log.error('Error recommending', error)

    return {
      errorCodes: [RecommendErrorCode.BadRequest],
    }
  }
})

export const joinGroupResolver = authorized<
  Merge<JoinGroupSuccess, { group: PartialRecommendationGroup }>,
  JoinGroupError,
  MutationJoinGroupArgs
>(async (_, { inviteCode }, { uid, log }) => {
  try {
    const user = await userRepository.findById(uid)
    if (!user) {
      return {
        errorCodes: [JoinGroupErrorCode.Unauthorized],
      }
    }

    const group = await joinGroup(user, inviteCode)

    analytics.capture({
      distinctId: uid,
      event: 'group_joined',
      properties: {
        group_id: group.id,
        group_name: group.name,
      },
    })

    await createLabelAndRuleForGroup(user.id, group.name)

    return {
      group,
    }
  } catch (error) {
    log.error('Error joining group', error)

    return {
      errorCodes: [JoinGroupErrorCode.BadRequest],
    }
  }
})

export const recommendHighlightsResolver = authorized<
  RecommendHighlightsSuccess,
  RecommendHighlightsError,
  MutationRecommendHighlightsArgs
>(async (_, { input }, { uid, log, signToken }) => {
  try {
    const user = await userRepository.findById(uid)
    if (!user) {
      return {
        errorCodes: [RecommendHighlightsErrorCode.Unauthorized],
      }
    }

    const groups = await getRepository(Group).find({
      where: { id: In(input.groupIds) },
      relations: ['members', 'members.user'],
    })
    if (groups.length === 0) {
      return {
        errorCodes: [RecommendHighlightsErrorCode.NotFound],
      }
    }

    const item = await findLibraryItemById(input.pageId, uid, {
      select: ['id'],
    })
    if (!item) {
      return {
        errorCodes: [RecommendHighlightsErrorCode.NotFound],
      }
    }

    const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 // 1 day
    const auth = (await signToken({ uid, exp }, env.server.jwtSecret)) as string
    await Promise.all(
      groups
        .map((group) =>
          group.members
            .filter((member) => member.user.id !== uid)
            .map((member) =>
              enqueueRecommendation(
                member.user.id,
                item.id,
                {
                  note: input.note,
                  recommender: { id: uid },
                  createdAt: new Date(),
                  libraryItem: { id: item.id },
                  group: { id: group.id, name: group.name },
                },
                auth,
                input.highlightIds
              )
            )
        )
        .flat()
    )

    return {
      success: true,
    }
  } catch (error) {
    log.error('Error recommending highlights', error)

    return {
      errorCodes: [RecommendHighlightsErrorCode.BadRequest],
    }
  }
})

export const leaveGroupResolver = authorized<
  LeaveGroupSuccess,
  LeaveGroupError,
  MutationLeaveGroupArgs
>(async (_, { groupId }, { uid, log }) => {
  try {
    const user = await userRepository.findById(uid)
    if (!user) {
      return {
        errorCodes: [LeaveGroupErrorCode.Unauthorized],
      }
    }

    const success = await leaveGroup(user, groupId)

    analytics.capture({
      distinctId: uid,
      event: 'group_left',
      properties: {
        group_id: groupId,
      },
    })

    return {
      success,
    }
  } catch (error) {
    log.error('Error leaving group', error)

    return {
      errorCodes: [LeaveGroupErrorCode.BadRequest],
    }
  }
})
