import { EntityManager } from 'typeorm'
import { appDataSource } from '../data_source'
import { Filter } from '../entity/filter'
import { GroupMembership } from '../entity/groups/group_membership'
import { Invite } from '../entity/groups/invite'
import { Profile } from '../entity/profile'
import { StatusType, User } from '../entity/user'
import { env } from '../env'
import { SignupErrorCode } from '../generated/graphql'
import { createPubSubClient } from '../pubsub'
import { authTrx, getRepository } from '../repository'
import { userRepository } from '../repository/user'
import { AuthProvider } from '../routers/auth/auth_types'
import { analytics } from '../utils/analytics'
import { IntercomClient } from '../utils/intercom'
import { logger } from '../utils/logger'
import { validateUsername } from '../utils/usernamePolicy'
import { addPopularReadsForNewUser } from './popular_reads'
import { sendNewAccountVerificationEmail } from './send_emails'

export const MAX_RECORDS_LIMIT = 1000

export const createUser = async (input: {
  provider: AuthProvider
  sourceUserId?: string
  email: string
  username: string
  name: string
  pictureUrl?: string
  bio?: string
  groups?: [string]
  inviteCode?: string
  password?: string
  pendingConfirmation?: boolean
}): Promise<[User, Profile]> => {
  const trimmedEmail = input.email.trim()
  const existingUser = await userRepository.findByEmail(trimmedEmail)
  if (existingUser) {
    if (existingUser.profile) {
      return Promise.reject({ errorCode: SignupErrorCode.Unknown })
    }

    // create profile if user exists but profile does not exist
    const profile = await getRepository(Profile).save({
      username: input.username,
      pictureUrl: input.pictureUrl,
      bio: input.bio,
      user: existingUser,
    })

    analytics.capture({
      distinctId: existingUser.id,
      event: 'create_user',
      properties: {
        env: env.server.apiEnv,
        email: existingUser.email,
        username: profile.username,
      },
    })

    return [existingUser, profile]
  }

  if (!validateUsername(input.username)) {
    return Promise.reject({ errorCode: SignupErrorCode.InvalidUsername })
  }

  const [user, profile] = await appDataSource.transaction<[User, Profile]>(
    async (t) => {
      let hasInvite = false
      let invite: Invite | null = null

      if (input.inviteCode) {
        const inviteCodeRepo = t.getRepository(Invite)
        invite = await inviteCodeRepo.findOne({
          where: { code: input.inviteCode },
          relations: ['group'],
        })
        if (invite && (await validateInvite(t, invite))) {
          hasInvite = true
        }
      }
      const user = await t.getRepository(User).save({
        source: input.provider,
        name: input.name,
        email: trimmedEmail,
        sourceUserId: input.sourceUserId,
        password: input.password,
        status: input.pendingConfirmation
          ? StatusType.Pending
          : StatusType.Active,
      })
      const profile = await t.getRepository(Profile).save({
        username: input.username,
        pictureUrl: input.pictureUrl,
        bio: input.bio,
        user,
      })
      if (hasInvite && invite) {
        await t.getRepository(GroupMembership).save({
          user: user,
          invite: invite,
          group: invite.group,
        })
      }

      await addPopularReadsForNewUser(user.id, t)
      await createDefaultFiltersForUser(t)(user.id)

      return [user, profile]
    }
  )

  const customAttributes: { source_user_id: string } = {
    source_user_id: user.sourceUserId,
  }
  await IntercomClient?.contacts.createUser({
    email: user.email,
    externalId: user.id,
    name: user.name,
    avatar: profile.pictureUrl || undefined,
    customAttributes: customAttributes,
    signedUpAt: Math.floor(Date.now() / 1000),
  })

  const pubsubClient = createPubSubClient()
  await pubsubClient.userCreated(
    user.id,
    user.email,
    user.name,
    profile.username
  )

  analytics.capture({
    distinctId: user.id,
    event: 'create_user',
    properties: {
      env: env.server.apiEnv,
      email: user.email,
      username: profile.username,
    },
  })

  if (input.pendingConfirmation) {
    if (!(await sendNewAccountVerificationEmail(user))) {
      return Promise.reject({ errorCode: SignupErrorCode.InvalidEmail })
    }
  }

  return [user, profile]
}

const createDefaultFiltersForUser =
  (t: EntityManager) =>
  async (userId: string): Promise<Filter[]> => {
    const defaultFilters = [
      { name: 'Inbox', filter: 'in:inbox' },
      {
        name: 'Continue Reading',
        filter: 'in:inbox sort:read-desc is:reading',
      },
      { name: 'Non-Feed Items', filter: 'no:subscription' },
      { name: 'Highlights', filter: 'in:all has:highlights mode:highlights' },
      { name: 'Unlabeled', filter: 'no:label' },
      { name: 'Oldest First', filter: 'sort:saved-asc' },
      { name: 'Files', filter: 'type:file' },
      { name: 'Archived', filter: 'in:archive' },
    ].map((it, position) => ({
      ...it,
      user: { id: userId },
      position,
      defaultFilter: true,
      category: 'Search',
    }))

    return t.getRepository(Filter).save(defaultFilters)
  }

// Maybe this should be moved into a service
const validateInvite = async (
  entityManager: EntityManager,
  invite: Invite
): Promise<boolean> => {
  if (invite.expirationTime < new Date()) {
    logger.info('rejecting invite, expired', invite)
    return false
  }
  const numMembers = await authTrx(
    (t) =>
      t.getRepository(GroupMembership).countBy({ invite: { id: invite.id } }),
    {
      entityManager,
    }
  )
  if (numMembers >= invite.maxMembers) {
    logger.info('rejecting invite, too many users', { invite, numMembers })
    return false
  }
  return true
}
