import { DatabaseError } from 'pg'
import { QueryFailedError } from 'typeorm'
import { UserDeviceToken } from '../../entity/user_device_tokens'
import { env } from '../../env'
import {
  DeviceToken,
  DeviceTokensError,
  DeviceTokensErrorCode,
  DeviceTokensSuccess,
  MutationSetDeviceTokenArgs,
  SetDeviceTokenError,
  SetDeviceTokenErrorCode,
  SetDeviceTokenSuccess,
} from '../../generated/graphql'
import {
  createDeviceToken,
  deleteDeviceToken,
  getDeviceToken,
  getDeviceTokenByToken,
  getDeviceTokensByUserId,
} from '../../services/user_device_tokens'
import { analytics } from '../../utils/analytics'
import { authorized } from '../../utils/helpers'

const PG_UNIQUE_CONSTRAINT_VIOLATION = '23505'

export const setDeviceTokenResolver = authorized<
  SetDeviceTokenSuccess,
  SetDeviceTokenError,
  MutationSetDeviceTokenArgs
>(async (_parent, { input }, { claims: { uid }, log }) => {
  log.info('setDeviceTokenResolver', input)

  const { id, token } = input

  if (!id && !token) {
    log.info('id or token is required')

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

export const deviceTokensResolver = authorized<
  DeviceTokensSuccess,
  DeviceTokensError
>(async (_parent, _args, { claims: { uid }, log }) => {
  try {
    log.info('deviceTokensResolver', {
      labels: {
        source: 'resolver',
        resolver: 'deviceTokensResolver',
        uid,
      },
    })

    const deviceTokens = await getDeviceTokensByUserId(uid)
    log.info('deviceTokens', deviceTokens)

    return {
      deviceTokens: deviceTokens.map(deviceTokenToData),
    }
  } catch (e) {
    log.error('Error getting device tokens', {
      e,
      labels: {
        source: 'resolver',
        resolver: 'rulesResolver',
        uid,
      },
    })

    return {
      errorCodes: [DeviceTokensErrorCode.BadRequest],
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
