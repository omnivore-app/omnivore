import { getManager, getRepository } from 'typeorm'
import { UserDeviceToken } from '../entity/user_device_tokens'
import { User } from '../entity/user'
import { SetDeviceTokenErrorCode } from '../generated/graphql'
import { setClaims } from '../entity/utils'
import { analytics } from '../utils/analytics'
import { env } from '../env'

export const getDeviceToken = async (
  id: string
): Promise<UserDeviceToken | undefined> => {
  return getRepository(UserDeviceToken).findOne(id)
}

export const getDeviceTokenByToken = async (
  token: string
): Promise<UserDeviceToken | undefined> => {
  return getRepository(UserDeviceToken).findOne({ token })
}

export const getDeviceTokensByUserId = async (
  userId: string
): Promise<UserDeviceToken[] | undefined> => {
  return getRepository(UserDeviceToken).find({ where: { user: userId } })
}

export const createDeviceToken = async (
  userId: string,
  token: string
): Promise<UserDeviceToken> => {
  const user = await getRepository(User).findOne(userId)
  if (!user) {
    return Promise.reject({
      errorCode: SetDeviceTokenErrorCode.Unauthorized,
    })
  }

  analytics.track({
    userId: userId,
    event: 'device_token_created',
    properties: {
      env: env.server.apiEnv,
    },
  })

  return getRepository(UserDeviceToken)
    .create({
      token: token,
      user: user,
    })
    .save()
}

export const deleteDeviceToken = async (
  id: string,
  userId: string
): Promise<boolean> => {
  const user = await getRepository(User).findOne(userId)
  if (!user) {
    return Promise.reject({
      errorCode: SetDeviceTokenErrorCode.Unauthorized,
    })
  }

  analytics.track({
    userId: userId,
    event: 'device_token_deleted',
    properties: {
      env: env.server.apiEnv,
    },
  })

  return getManager().transaction(async (t) => {
    await setClaims(t, userId)
    const result = await t.getRepository(UserDeviceToken).delete(id)

    return !!result.affected
  })
}
