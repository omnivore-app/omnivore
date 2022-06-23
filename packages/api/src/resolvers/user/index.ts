import {
  DeleteAccountSuccess,
  DeleteAccountError,
  DeleteAccountErrorCode,
  MutationDeleteAccountArgs,
  GoogleSignupResult,
  LoginErrorCode,
  LoginResult,
  LogOutErrorCode,
  LogOutResult,
  MutationGoogleLoginArgs,
  MutationGoogleSignupArgs,
  MutationLoginArgs,
  MutationSignupArgs,
  MutationUpdateUserArgs,
  MutationUpdateUserProfileArgs,
  QueryUserArgs,
  QueryValidateUsernameArgs,
  ResolverFn,
  SignupErrorCode,
  SignupResult,
  UpdateUserError,
  UpdateUserErrorCode,
  UpdateUserProfileError,
  UpdateUserProfileErrorCode,
  UpdateUserProfileSuccess,
  UpdateUserSuccess,
  User,
  UserErrorCode,
  UserResult,
  UsersError,
  UsersSuccess,
} from '../../generated/graphql'
import { WithDataSourcesContext } from '../types'
import { authorized, userDataToUser } from '../../utils/helpers'
import { env } from '../../env'
import { validateUsername } from '../../utils/usernamePolicy'
import * as jwt from 'jsonwebtoken'
import { createUser } from '../../services/create_user'
import { comparePassword, hashPassword } from '../../utils/auth'
import type { UserData } from '../../datalayer/user/model'

export const updateUserResolver = authorized<
  UpdateUserSuccess,
  UpdateUserError,
  MutationUpdateUserArgs
>(async (_, { input: { name, bio } }, { models, authTrx, claims }) => {
  const user = await models.user.get(claims.uid)
  if (!user) {
    return { errorCodes: [UpdateUserErrorCode.UserNotFound] }
  }

  const errorCodes = []

  if (!name) {
    errorCodes.push(UpdateUserErrorCode.EmptyName)
  }

  if (bio && bio.length > 400) {
    errorCodes.push(UpdateUserErrorCode.BioTooLong)
  }

  if (errorCodes.length > 0) {
    return { errorCodes }
  }

  const updatedUser = await authTrx(async (tx) => {
    const [updatedRecord, profile] = await Promise.all([
      models.user.update(
        claims.uid,
        { name, source: user.source, sourceUserId: user.sourceUserId },
        tx
      ),
      models.user.updateProfile(claims.uid, { bio }, tx),
    ])
    return { ...updatedRecord, profile }
  })

  return { user: userDataToUser(updatedUser) }
})

export const updateUserProfileResolver = authorized<
  UpdateUserProfileSuccess,
  UpdateUserProfileError,
  MutationUpdateUserProfileArgs
>(
  async (
    _,
    { input: { userId, username, pictureUrl } },
    { models, authTrx, claims }
  ) => {
    const user = await models.user.get(userId)
    if (user.id !== claims.uid) {
      return {
        errorCodes: [UpdateUserProfileErrorCode.Forbidden],
      }
    }

    if (!(username || pictureUrl)) {
      return {
        errorCodes: [UpdateUserProfileErrorCode.BadData],
      }
    }

    const lowerCasedUsername = username?.toLowerCase()
    if (lowerCasedUsername) {
      const existingUser = await models.user.getWhere({
        username: lowerCasedUsername,
      })
      if (existingUser?.id) {
        return {
          errorCodes: [UpdateUserProfileErrorCode.UsernameExists],
        }
      }

      if (!validateUsername(lowerCasedUsername)) {
        return {
          errorCodes: [UpdateUserProfileErrorCode.BadUsername],
        }
      }
    }

    const updatedProfile = await authTrx((tx) =>
      models.user.updateProfile(
        userId,
        {
          username: lowerCasedUsername,
          picture_url: pictureUrl,
        },
        tx
      )
    )

    user.profile = {
      ...updatedProfile,
      picture_url: updatedProfile.pictureUrl,
    }

    return { user: userDataToUser(user) }
  }
)

export const googleLoginResolver: ResolverFn<
  LoginResult,
  unknown,
  WithDataSourcesContext,
  MutationGoogleLoginArgs
> = async (_obj, { input }, { models, setAuth }) => {
  const { email, secret } = input

  try {
    jwt.verify(secret, env.server.jwtSecret)
  } catch {
    return { errorCodes: [LoginErrorCode.AuthFailed] }
  }

  const user = await models.user.getWhere({
    email,
  })
  if (!user?.id) {
    return { errorCodes: [LoginErrorCode.UserNotFound] }
  }

  // set auth cookie in response header
  await setAuth({ uid: user.id })
  return { me: userDataToUser(user) }
}

export const validateUsernameResolver: ResolverFn<
  boolean,
  Record<string, unknown>,
  WithDataSourcesContext,
  QueryValidateUsernameArgs
> = async (_obj, { username }, { models }) => {
  const lowerCasedUsername = username.toLowerCase()
  if (!validateUsername(lowerCasedUsername)) {
    return false
  }

  return !(await models.user.exists({ username: lowerCasedUsername }))
}

export const googleSignupResolver: ResolverFn<
  GoogleSignupResult,
  Record<string, unknown>,
  WithDataSourcesContext,
  MutationGoogleSignupArgs
> = async (_obj, { input }, { setAuth }) => {
  const { email, username, name, bio, sourceUserId, pictureUrl, secret } = input
  const lowerCasedUsername = username.toLowerCase()

  try {
    jwt.verify(secret, env.server.jwtSecret)
  } catch {
    return { errorCodes: [SignupErrorCode.ExpiredToken] }
  }

  try {
    const [user, profile] = await createUser({
      email,
      sourceUserId,
      provider: 'GOOGLE',
      name,
      username: lowerCasedUsername,
      pictureUrl: pictureUrl,
      bio: bio || undefined,
      inviteCode: undefined,
    })

    await setAuth({ uid: user.id })
    return {
      me: userDataToUser({ ...user, profile: { ...profile, private: false } }),
    }
  } catch (err) {
    console.log('error', err)
    if (isErrorWithCode(err)) {
      return { errorCodes: [err.errorCode as SignupErrorCode] }
    }
    return { errorCodes: [SignupErrorCode.Unknown] }
  }
}

export const logOutResolver: ResolverFn<
  LogOutResult,
  unknown,
  WithDataSourcesContext,
  unknown
> = (_, __, { clearAuth }) => {
  try {
    clearAuth()
    return { message: 'User successfully logged out' }
  } catch (error) {
    console.error(error)
    return { errorCodes: [LogOutErrorCode.LogOutFailed] }
  }
}

export const getMeUserResolver: ResolverFn<
  User | undefined,
  unknown,
  WithDataSourcesContext,
  unknown
> = async (_obj, __, { models, claims }) => {
  try {
    return claims?.uid
      ? userDataToUser(await models.user.get(claims.uid))
      : undefined
  } catch (error) {
    return undefined
  }
}

export const getUserResolver: ResolverFn<
  UserResult,
  unknown,
  WithDataSourcesContext,
  QueryUserArgs
> = async (_obj, { userId: id, username }, { models, claims }) => {
  if (!(id || username)) {
    return { errorCodes: [UserErrorCode.BadRequest] }
  }

  const userId =
    id || (username && (await models.user.getWhere({ username }))?.id)
  if (!userId) {
    return { errorCodes: [UserErrorCode.UserNotFound] }
  }

  const userRecord = await models.user.getUserDetails(claims?.uid, userId)
  if (!userRecord) {
    return { errorCodes: [UserErrorCode.UserNotFound] }
  }

  return { user: userDataToUser(userRecord) }
}

export const getAllUsersResolver = authorized<UsersSuccess, UsersError>(
  async (_obj, _params, { models, claims, authTrx }) => {
    const users =
      (await authTrx((tx) => models.user.getTopUsers(claims.uid, tx))) || []
    const result = { users: users.map((userData) => userDataToUser(userData)) }
    return result
  }
)

type ErrorWithCode = {
  errorCode: string
}

export function isErrorWithCode(error: unknown): error is ErrorWithCode {
  return (
    (error as ErrorWithCode).errorCode !== undefined &&
    typeof (error as ErrorWithCode).errorCode === 'string'
  )
}

export const loginResolver: ResolverFn<
  LoginResult,
  unknown,
  WithDataSourcesContext,
  MutationLoginArgs
> = async (_obj, { input }, { models, setAuth }) => {
  const { email, password } = input

  const user = await models.user.getWhere({
    email,
  })
  if (!user?.id) {
    return { errorCodes: [LoginErrorCode.UserNotFound] }
  }

  if (!user?.password) {
    // user has no password, so they need to set one
    return { errorCodes: [LoginErrorCode.WrongSource] }
  }

  // check if password is correct
  const validPassword = await comparePassword(password, user.password)
  if (!validPassword) {
    return { errorCodes: [LoginErrorCode.InvalidCredentials] }
  }

  // set auth cookie in response header
  await setAuth({ uid: user.id })
  return { me: userDataToUser(user) }
}

export const signupResolver: ResolverFn<
  SignupResult,
  Record<string, unknown>,
  WithDataSourcesContext,
  MutationSignupArgs
> = async (_obj, { input }) => {
  const { email, username, name, bio, password, pictureUrl } = input
  const lowerCasedUsername = username.toLowerCase()

  try {
    // hash password
    const hashedPassword = await hashPassword(password)

    const [user, profile] = await createUser({
      email,
      provider: 'EMAIL',
      sourceUserId: email,
      name,
      username: lowerCasedUsername,
      pictureUrl: pictureUrl || undefined,
      bio: bio || undefined,
      password: hashedPassword,
    })

    return {
      me: userDataToUser({ ...user, profile: { ...profile, private: false } }),
    }
  } catch (err) {
    console.log('error', err)
    if (isErrorWithCode(err)) {
      return { errorCodes: [err.errorCode as SignupErrorCode] }
    }
    return { errorCodes: [SignupErrorCode.Unknown] }
  }
}

export const deleteAccountResolver = authorized<
  DeleteAccountSuccess,
  DeleteAccountError,
  MutationDeleteAccountArgs
>(async (_, { userID }, { models, claims, log, authTrx }) => {
  const user = await models.user.get(userID)

  if (!user || user.id !== claims.uid) {
    return {
      errorCodes: [DeleteAccountErrorCode.Unauthorized],
    }
  }

  const deleteUserResult = await authTrx((tx) =>
    models.user.deleteUser(claims.uid, tx)
  )

  log.info('Deleting a user account', {
    userID,
    labels: {
      source: 'resolver',
      resolver: 'deleteAccountResolver',
      uid: claims.uid,
    },
  })

  if ((deleteUserResult as UserData).id !== undefined) {
    return { userID }
  } else {
    return {
      errorCodes: [DeleteAccountErrorCode.Forbidden],
    }
  }
})
