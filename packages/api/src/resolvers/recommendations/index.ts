import {
  CreateGroupError,
  CreateGroupErrorCode,
  CreateGroupSuccess,
  GroupsError,
  GroupsErrorCode,
  GroupsSuccess,
  MutationCreateGroupArgs,
} from '../../generated/graphql'
import {
  createGroup,
  getInviteUrl,
  getRecommendationGroups,
} from '../../services/create_group'
import { authorized, userDataToUser } from '../../utils/helpers'
import { getRepository } from '../../entity/utils'
import { User } from '../../entity/user'

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
