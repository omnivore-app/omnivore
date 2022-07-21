import { AuthProvider } from '../routers/auth/auth_types'
import { MembershipTier, StatusType } from '../datalayer/user/model'
import { EntityManager } from 'typeorm'
import { User } from '../entity/user'
import { Profile } from '../entity/profile'
import { SignupErrorCode } from '../generated/graphql'
import { validateUsername } from '../utils/usernamePolicy'
import { Invite } from '../entity/groups/invite'
import { GroupMembership } from '../entity/groups/group_membership'
import { AppDataSource } from '../server'
import { getRepository } from '../entity/utils'
import { generateVerificationToken } from '../utils/auth'
import { env } from '../env'
import { sendEmail } from '../utils/sendEmail'

export const createUser = async (input: {
  provider: AuthProvider
  sourceUserId?: string
  email: string
  username: string
  name: string
  pictureUrl?: string
  bio?: string
  groups?: [string]
  membershipTier?: MembershipTier
  inviteCode?: string
  password?: string
  pendingConfirmation?: boolean
}): Promise<[User, Profile]> => {
  const existingUser = await getUser(input.email)
  if (existingUser) {
    if (existingUser.profile) {
      return Promise.reject({ errorCode: SignupErrorCode.UserExists })
    }

    // create profile if user exists but profile does not exist
    const profile = await getRepository(Profile).save({
      username: input.username,
      pictureUrl: input.pictureUrl,
      bio: input.bio,
      user: existingUser,
    })

    return [existingUser, profile]
  }

  if (!validateUsername(input.username)) {
    return Promise.reject({ errorCode: SignupErrorCode.InvalidUsername })
  }

  const [user, profile] = await AppDataSource.transaction<[User, Profile]>(
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
        membership:
          input.membershipTier ||
          (hasInvite ? MembershipTier.Beta : MembershipTier.WaitList),
        name: input.name,
        email: input.email,
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
      return [user, profile]
    }
  )

  if (input.pendingConfirmation) {
    if (!(await sendConfirmationEmail(user))) {
      return Promise.reject({ errorCode: SignupErrorCode.InvalidEmail })
    }
  }

  return [user, profile]
}

// TODO: Maybe this should be moved into a service
const validateInvite = async (
  entityManager: EntityManager,
  invite: Invite
): Promise<boolean> => {
  if (invite.expirationTime < new Date()) {
    console.log('rejecting invite, expired', invite)
    return false
  }
  const membershipRepo = entityManager.getRepository(GroupMembership)
  const numMembers = await membershipRepo.count({
    where: { invite: invite },
  })
  if (numMembers >= invite.maxMembers) {
    console.log('rejecting invite, too many users', invite, numMembers)
    return false
  }
  return true
}

const getUser = async (email: string): Promise<User | null> => {
  const userRepo = getRepository(User)

  return userRepo.findOne({
    where: { email: email },
    relations: ['profile'],
  })
}

export const sendConfirmationEmail = async (user: {
  id: string
  name: string
  email: string
}): Promise<boolean> => {
  // generate confirmation link
  const confirmationToken = generateVerificationToken(user.id)
  const confirmationLink = `${env.client.url}/api/auth/confirm-email/${confirmationToken}`
  // send email
  return sendEmail({
    from: `Omnivore <${env.sender.message}>`,
    to: user.email,
    subject: 'Confirm your email',
    text: `Hey ${user.name},\n\nPlease confirm your email by clicking the link below:\n\n${confirmationLink}\n\n`,
  })
}
