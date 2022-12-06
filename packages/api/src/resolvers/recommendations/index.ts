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
  MutationCreateGroupArgs,
  MutationJoinGroupArgs,
  MutationRecommendArgs,
  RecommendError,
  RecommendErrorCode,
  RecommendSuccess,
} from '../../generated/graphql'
import {
  createGroup,
  getInviteUrl,
  getRecommendationGroups,
  joinGroup,
} from '../../services/groups'
import { authorized, userDataToUser } from '../../utils/helpers'
import { getRepository } from '../../entity/utils'
import { User } from '../../entity/user'
import { Group } from '../../entity/groups/group'
import { In } from 'typeorm'
import { getPageByParam } from '../../elastic/pages'
import { enqueueRecommendation } from '../../utils/createTask'
import { env } from '../../env'

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
    const userData = await getRepository(User).findOne({
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
    })

    const inviteUrl = getInviteUrl(invite)
    const user = userDataToUser(userData)

    return {
      group: {
        ...group,
        inviteUrl,
        admins: [user],
        members: [user],
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
      const user = await getRepository(User).findOneBy({
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
    const user = await getRepository(User).findOne({
      where: { id: uid },
      relations: ['profile'],
    })
    if (!user) {
      return {
        errorCodes: [RecommendErrorCode.Unauthorized],
      }
    }

    const groups = await getRepository(Group).find({
      where: { id: In(input.groupIds) },
      relations: ['members', 'members.user'],
    })
    if (groups.length === 0) {
      return {
        errorCodes: [RecommendErrorCode.NotFound],
      }
    }

    const page = await getPageByParam({ _id: input.pageId, userId: uid })
    if (!page) {
      return {
        errorCodes: [RecommendErrorCode.NotFound],
      }
    }

    const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 // 1 day
    const auth = (await signToken({ uid, exp }, env.server.jwtSecret)) as string
    const taskNames = await Promise.all(
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
                  note: input.note ?? null,
                  user: {
                    userId: user.id,
                    name: user.name,
                    username: user.profile.username,
                    profileImageURL: user.profile.pictureUrl,
                  },
                  recommendedAt: new Date(),
                },
                auth
              )
            )
        )
        .flat()
    )

    return {
      taskNames,
    }
  } catch (error) {
    console.log('Error recommending: ', error)
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
    const user = await getRepository(User).findOne({
      where: { id: uid },
      relations: ['profile'],
    })
    if (!user) {
      return {
        errorCodes: [JoinGroupErrorCode.Unauthorized],
      }
    }

    const group = await joinGroup(user, inviteCode)

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
