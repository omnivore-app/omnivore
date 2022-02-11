import { JsonResponsePayload, UserProfile } from '../auth_types'
import {
  decodePendingUserToken,
  createMobileAuthPayload,
} from './../jwt_helpers'
import { createUser } from '../../../services/create_user'
import { SignupErrorCode } from '../../../generated/graphql'
import { MembershipTier } from '../../../datalayer/user/model'

export async function createMobileAccountCreationResponse(
  pendingUserToken?: string,
  userProfile?: UserProfile
): Promise<JsonResponsePayload> {
  try {
    if (
      typeof pendingUserToken !== 'string' ||
      typeof userProfile !== 'object'
    ) {
      return accountCreationFailedPayload
    }

    const decodedToken = decodePendingUserToken(pendingUserToken)

    if (!decodedToken) {
      return accountCreationFailedPayload
    }

    const { email, provider, sourceUserId } = decodedToken
    const [user] = await createUser({
      email,
      sourceUserId,
      provider,
      name: userProfile.name,
      username: userProfile.username,
      pictureUrl: undefined,
      bio: userProfile.bio || undefined,
      membershipTier: MembershipTier.Beta,
    })

    const mobileAuthPayload = await createMobileAuthPayload(user.id)

    return {
      statusCode: 200,
      json: mobileAuthPayload,
    }
  } catch (error) {
    if (isErrorWithCode(error)) {
      if (error.errorCode === SignupErrorCode.UserExists) {
        return {
          statusCode: 400,
          json: { errorCodes: ['USER_ALREADY_EXISTS'] },
        }
      }
    }
    return accountCreationFailedPayload
  }
}

const accountCreationFailedPayload = {
  statusCode: 400,
  json: { errorCodes: ['AUTH_FAILED'] },
}

type ErrorWithCode = {
  errorCode: string
}

export function isErrorWithCode(error: unknown): error is ErrorWithCode {
  return (
    (error as ErrorWithCode).errorCode !== undefined &&
    typeof (error as ErrorWithCode).errorCode === 'string'
  )
}
