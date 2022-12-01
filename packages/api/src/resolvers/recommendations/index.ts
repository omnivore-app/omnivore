import {
  CreateGroupError,
  CreateGroupErrorCode,
  CreateGroupSuccess,
  MutationCreateGroupArgs,
} from '../../generated/graphql'
import { createGroup } from '../../services/create_group'
import { authorized, userDataToUser } from '../../utils/helpers'
import { homePageURL } from '../../env'
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

    const inviteUrl = `${homePageURL()}/invite/${invite.code}`
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
