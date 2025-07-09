import cors from 'cors'
import express from 'express'
import * as jwt from 'jsonwebtoken'
import { env } from '../env'
import { Claims } from '../resolvers/types'
import { findDeviceTokensByUserId } from '../services/user_device_tokens'
import { corsConfig } from '../utils/corsConfig'
import {
  PushNotificationType,
  sendMulticastPushNotifications,
} from '../utils/sendNotification'

interface Notification {
  body: string
  title?: string
  data?: Record<string, string>
  image?: string
  notificationType?: PushNotificationType
}

export function notificationRouter() {
  const router = express.Router()

  router.options('/send', cors<express.Request>({ ...corsConfig, maxAge: 600 }))
  router.post(
    '/send',
    cors<express.Request>(corsConfig),
    async (req: express.Request, res: express.Response): Promise<void> => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const token = (req.cookies?.auth || req.headers?.authorization) as string
      if (!token || !jwt.verify(token, env.server.jwtSecret)) {
        res.status(401).send({ errorCode: 'UNAUTHORIZED' })
        return
      }

      const claims = jwt.decode(token) as Claims
      const { uid: userId } = claims
      const {
        body,
        title,
        data,
        image: imageUrl,
        notificationType,
      } = req.body as Notification

      if (!userId || !body) {
        res.status(400).send({ errorCode: 'BAD_DATA' })
        return
      }

      const tokens = await findDeviceTokensByUserId(userId)
      if (tokens.length === 0) {
        res.status(400).send({ errorCode: 'NO_DEVICE_TOKENS' })
        return
      }

      const message = {
        notification: {
          title,
          body,
          imageUrl,
        },
        data,
        tokens: tokens.map((token) => token.token),
      }

      const result = await sendMulticastPushNotifications(
        userId,
        message,
        notificationType || 'rule'
      )
      if (!result) {
        res.status(400).send({ errorCode: 'SEND_NOTIFICATION_FAILED' })
        return
      }

      res.send('OK')
    }
  )

  return router
}
