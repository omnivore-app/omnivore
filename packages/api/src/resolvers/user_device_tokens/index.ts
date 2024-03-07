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
  findDeviceTokenById,
  findDeviceTokenByToken,
  findDeviceTokensByUserId,
} from '../../services/user_device_tokens'
import { analytics } from '../../utils/analytics'
import { authorized } from '../../utils/gql-utils'

const PG_UNIQUE_CONSTRAINT_VIOLATION = '23505'

export const setDeviceTokenResolver = authorized<
  SetDeviceTokenSuccess,
  SetDeviceTokenError,
  MutationSetDeviceTokenArgs
>(async (_parent, { input }, { uid, log }) => {
  const { id, token } = input

  if (!id && !token) {
    log.error('id or token is required')

    return {
      errorCodes: [SetDeviceTokenErrorCode.BadRequest],
    }
  }

  try {
    // when token is null, we are deleting it
    if (!token && id) {
      const deviceToken = await findDeviceTokenById(id, uid)
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

      analytics.capture({
        distinctId: uid,
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

      analytics.capture({
        distinctId: uid,
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
      const deviceToken = await findDeviceTokenByToken(token, uid)

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

    const deviceTokens = await findDeviceTokensByUserId(uid)
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
