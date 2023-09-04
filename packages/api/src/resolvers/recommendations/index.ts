import { In } from 'typeorm'
import { getPageByParam } from '../../elastic/pages'
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
  RecommendError,
  RecommendErrorCode,
  RecommendHighlightsError,
  RecommendHighlightsErrorCode,
  RecommendHighlightsSuccess,
  RecommendSuccess,
} from '../../generated/graphql'
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
import { analytics } from '../../utils/analytics'
import { enqueueRecommendation } from '../../utils/createTask'
import { authorized, userDataToUser } from '../../utils/helpers'

export const createGroupResolver = authorized<
  CreateGroupSuccess,
  CreateGroupError,
  MutationCreateGroupArgs
>(async (_, { input }, { claims: { uid }, log }) => {
  log.info('Creating group', {
    input,
    labels: {
      source: 'resolver',
      resolver: 'createGroupResolver',
      uid,
    },
  })

  try {
    const userData = await userRepository.findOne({
      where: { id: uid },
      relations: ['profile'],
    })
    if (!userData) {
      return {
        errorCodes: [CreateGroupErrorCode.Unauthorized],
      }
    }

    const [group, invite] = await createGroup({
      admin: userData,
      name: input.name,
      maxMembers: input.maxMembers,
      expiresInDays: input.expiresInDays,
      description: input.description,
      topics: input.topics,
      onlyAdminCanPost: input.onlyAdminCanPost,
      onlyAdminCanSeeMembers: input.onlyAdminCanSeeMembers,
    })

    analytics.track({
      userId: uid,
      event: 'group_created',
      properties: {
        group_id: group.id,
        group_name: group.name,
        group_invite_code: invite.code,
      },
    })

    await createLabelAndRuleForGroup(uid, group.name)

    const inviteUrl = getInviteUrl(invite)
    const user = userDataToUser(userData)

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
    log.error('Error creating group', {
      error,
      labels: {
        source: 'resolver',
        resolver: 'createGroupResolver',
        uid,
      },
    })

    return {
      errorCodes: [CreateGroupErrorCode.BadRequest],
    }
  }
})

export const groupsResolver = authorized<GroupsSuccess, GroupsError>(
  async (_, __, { claims: { uid }, log }) => {
    log.info('Getting groups', {
      labels: {
        source: 'resolver',
        resolver: 'groupsResolver',
        uid,
      },
    })

    try {
      const user = await userRepository.findOneBy({
        id: uid,
      })
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
  }
)

export const recommendResolver = authorized<
  RecommendSuccess,
  RecommendError,
  MutationRecommendArgs
>(async (_, { input }, { claims: { uid }, log, signToken }) => {
  log.info('Recommend', {
    input,
    labels: {
      source: 'resolver',
      resolver: 'recommendResolver',
      uid,
    },
  })

  try {
    const user = await userRepository.findOne({
      where: { id: uid },
      relations: ['profile'],
    })
    if (!user) {
      return {
        errorCodes: [RecommendErrorCode.Unauthorized],
      }
    }

    const page = await getPageByParam({ _id: input.pageId, userId: uid })
    if (!page) {
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
      ? page.highlights?.filter((h) => h.userId === uid)?.map((h) => h.id)
      : undefined

    const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 // 1 day
    const auth = (await signToken({ uid, exp }, env.server.jwtSecret)) as string
    const taskNames = await Promise.all(
      groups
        .map((group) =>
          group.members.map((member) =>
            enqueueRecommendation(
              member.user.id,
              page.id,
              {
                id: group.id,
                name: group.name,
                note: input.note ?? null,
                user: {
                  userId: user.id,
                  name: user.name,
                  username: user.profile.username,
                  profileImageURL: user.profile.pictureUrl,
                },
                recommendedAt: new Date(),
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
    log.error('Error recommending', {
      error,
      labels: {
        source: 'resolver',
        resolver: 'recommendResolver',
        uid,
      },
    })

    return {
      errorCodes: [RecommendErrorCode.BadRequest],
    }
  }
})

export const joinGroupResolver = authorized<
  JoinGroupSuccess,
  JoinGroupError,
  MutationJoinGroupArgs
>(async (_, { inviteCode }, { claims: { uid }, log }) => {
  log.info('Joining group', {
    inviteCode,
    labels: {
      source: 'resolver',
      resolver: 'joinGroupResolver',
      uid,
    },
  })

  try {
    const user = await userRepository.findOne({
      where: { id: uid },
      relations: ['profile'],
    })
    if (!user) {
      return {
        errorCodes: [JoinGroupErrorCode.Unauthorized],
      }
    }

    const group = await joinGroup(user, inviteCode)

    analytics.track({
      userId: uid,
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
    log.error('Error joining group', {
      error,
      labels: {
        source: 'resolver',
        resolver: 'joinGroupResolver',
        uid,
      },
    })

    return {
      errorCodes: [JoinGroupErrorCode.BadRequest],
    }
  }
})

export const recommendHighlightsResolver = authorized<
  RecommendHighlightsSuccess,
  RecommendHighlightsError,
  MutationRecommendHighlightsArgs
>(async (_, { input }, { claims: { uid }, log, signToken }) => {
  log.info('Recommend highlights', {
    input,
    labels: {
      source: 'resolver',
      resolver: 'recommendHighlightsResolver',
      uid,
    },
  })

  try {
    const user = await userRepository.findOne({
      where: { id: uid },
      relations: ['profile'],
    })
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

    const page = await getPageByParam({ _id: input.pageId, userId: uid })
    if (!page) {
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
                page.id,
                {
                  id: group.id,
                  name: group.name,
                  note: input.note,
                  user: {
                    userId: user.id,
                    name: user.name,
                    username: user.profile.username,
                    profileImageURL: user.profile.pictureUrl,
                  },
                  recommendedAt: new Date(),
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
    log.error('Error recommending highlights', {
      error,
      labels: {
        source: 'resolver',
        resolver: 'recommendHighlightsResolver',
        uid,
      },
    })

    return {
      errorCodes: [RecommendHighlightsErrorCode.BadRequest],
    }
  }
})

export const leaveGroupResolver = authorized<
  LeaveGroupSuccess,
  LeaveGroupError,
  MutationLeaveGroupArgs
>(async (_, { groupId }, { claims: { uid }, log }) => {
  log.info('Leaving group', {
    groupId,
    labels: {
      source: 'resolver',
      resolver: 'leaveGroupResolver',
      uid,
    },
  })

  try {
    const user = await userRepository.findOneBy({
      id: uid,
    })
    if (!user) {
      return {
        errorCodes: [LeaveGroupErrorCode.Unauthorized],
      }
    }

    const success = await leaveGroup(user, groupId)

    analytics.track({
      userId: uid,
      event: 'group_left',
      properties: {
        group_id: groupId,
      },
    })

    return {
      success,
    }
  } catch (error) {
    log.error('Error leaving group', {
      error,
      labels: {
        source: 'resolver',
        resolver: 'leaveGroupResolver',
        uid,
      },
    })

    return {
      errorCodes: [LeaveGroupErrorCode.BadRequest],
    }
  }
})
