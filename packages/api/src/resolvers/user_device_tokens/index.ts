import { authorized } from '../../utils/helpers'
import {
  DeviceToken,
  MutationSetDeviceTokenArgs,
  SetDeviceTokenError,
  SetDeviceTokenErrorCode,
  SetDeviceTokenSuccess,
} from '../../generated/graphql'
import { analytics } from '../../utils/analytics'
import { env } from '../../env'
import {
  createDeviceToken,
  deleteDeviceToken,
  getDeviceToken,
  getDeviceTokenByToken,
} from '../../services/user_device_tokens'
import { UserDeviceToken } from '../../entity/user_device_tokens'
import { QueryFailedError } from 'typeorm'
import { DatabaseError } from 'pg'

const PG_UNIQUE_CONSTRAINT_VIOLATION = '23505'

export const setDeviceTokenResolver = authorized<
  SetDeviceTokenSuccess,
  SetDeviceTokenError,
  MutationSetDeviceTokenArgs
>(async (_parent, { input }, { claims: { uid }, log }) => {
  console.log('setDeviceTokenResolver', input)

  const { id, token } = input

  if (!id && !token) {
    console.log('id or token is required')

    return {
      errorCodes: [SetDeviceTokenErrorCode.BadRequest],
    }
  }

  try {
    // when token is null, we are deleting it
    if (!token && id) {
      const deviceToken = await getDeviceToken(id)
      if (!deviceToken) {
        log.error('device token not found', id)

        return {
          errorCodes: [SetDeviceTokenErrorCode.NotFound],
        }
      }
      // delete token
      const result = await deleteDeviceToken(id, uid)
      if (!result) {
        log.error('device token not deleted', id)

        return {
          errorCodes: [SetDeviceTokenErrorCode.BadRequest],
        }
      }

      analytics.track({
        userId: uid,
        event: 'device_token_deleted',
        properties: {
          id: deviceToken.id,
          token: deviceToken.token,
          env: env.server.apiEnv,
        },
      })

      return {
        deviceToken: deviceTokenToData(deviceToken),
      }
    } else if (token) {
      // create token
      const deviceToken = await createDeviceToken(uid, token)

      analytics.track({
        userId: uid,
        event: 'device_token_created',
        properties: {
          id: deviceToken.id,
          token: deviceToken.token,
          env: env.server.apiEnv,
        },
      })

      return {
        deviceToken: deviceTokenToData(deviceToken),
      }
    }

    return {
      errorCodes: [SetDeviceTokenErrorCode.BadRequest],
    }
  } catch (e) {
    log.error(e)

    if (
      e instanceof QueryFailedError &&
      (e.driverError as DatabaseError).code ===
        PG_UNIQUE_CONSTRAINT_VIOLATION &&
      token
    ) {
      // duplicate token
      const deviceToken = await getDeviceTokenByToken(token)

      if (!deviceToken) {
        return {
          errorCodes: [SetDeviceTokenErrorCode.NotFound],
        }
      }

      return {
        deviceToken: deviceTokenToData(deviceToken),
      }
    }

    return {
      errorCodes: [SetDeviceTokenErrorCode.Unauthorized],
    }
  }
})

const deviceTokenToData = (deviceToken: UserDeviceToken): DeviceToken => {
  return {
    id: deviceToken.id,
    token: deviceToken.token,
    createdAt: deviceToken.createdAt,
  }
}
