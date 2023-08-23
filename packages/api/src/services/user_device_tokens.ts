import { AppDataSource } from '../data-source'
import { User } from '../entity/user'
import { UserDeviceToken } from '../entity/user_device_tokens'
import { env } from '../env'
import { SetDeviceTokenErrorCode } from '../generated/graphql'
import { getRepository, setClaims } from '../repository'
import { analytics } from '../utils/analytics'

export const getDeviceToken = async (
  id: string
): Promise<UserDeviceToken | null> => {
  return getRepository(UserDeviceToken).findOneBy({ id })
}

export const getDeviceTokenByToken = async (
  token: string
): Promise<UserDeviceToken | null> => {
  return getRepository(UserDeviceToken).findOneBy({ token })
}

export const getDeviceTokensByUserId = async (
  userId: string
): Promise<UserDeviceToken[]> => {
  return getRepository(UserDeviceToken).find({
    where: { user: { id: userId } },
  })
}

export const createDeviceToken = async (
  userId: string,
  token: string
): Promise<UserDeviceToken> => {
  const user = await getRepository(User).findOneBy({ id: userId })
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

  return getRepository(UserDeviceToken).save({
    token: token,
    user: user,
  })
}

export const deleteDeviceToken = async (
  id: string,
  userId: string
): Promise<boolean> => {
  const user = await getRepository(User).findOneBy({ id: userId })
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

  return AppDataSource.transaction(async (t) => {
    await setClaims(t, userId)
    const result = await t.getRepository(UserDeviceToken).delete(id)

    return !!result.affected
  })
}
