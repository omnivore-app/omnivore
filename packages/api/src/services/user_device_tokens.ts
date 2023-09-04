import { UserDeviceToken } from '../entity/user_device_tokens'
import { env } from '../env'
import { authTrx } from '../repository'
import { analytics } from '../utils/analytics'

export const getDeviceToken = async (
  id: string
): Promise<UserDeviceToken | null> => {
  return authTrx((t) => t.getRepository(UserDeviceToken).findOneBy({ id }))
}

export const getDeviceTokenByToken = async (
  token: string
): Promise<UserDeviceToken | null> => {
  return authTrx((t) => t.getRepository(UserDeviceToken).findOneBy({ token }))
}

export const getDeviceTokensByUserId = async (
  userId: string
): Promise<UserDeviceToken[]> => {
  return authTrx((t) =>
    t.getRepository(UserDeviceToken).findBy({
      user: { id: userId },
    })
  )
}

export const createDeviceToken = async (
  userId: string,
  token: string
): Promise<UserDeviceToken> => {
  analytics.track({
    userId: userId,
    event: 'device_token_created',
    properties: {
      env: env.server.apiEnv,
    },
  })

  return authTrx((t) =>
    t.getRepository(UserDeviceToken).save({
      token,
      user: { id: userId },
    })
  )
}

export const deleteDeviceToken = async (
  id: string,
  userId: string
): Promise<boolean> => {
  analytics.track({
    userId: userId,
    event: 'device_token_deleted',
    properties: {
      env: env.server.apiEnv,
    },
  })

  return authTrx(async (t) => {
    const result = await t.getRepository(UserDeviceToken).delete(id)

    return !!result.affected
  })
}
