/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import express from 'express'
import { DateTime } from 'luxon'
import { v4 as uuidv4 } from 'uuid'
import { env } from '../../env'
import { readPushSubscription } from '../../pubsub'
import { logger } from '../../utils/logger'
import { uploadToBucket } from '../../utils/uploads'

export function uploadServiceRouter() {
  const router = express.Router()

  router.post(
    '/:folder',
    async (req: express.Request, res: express.Response): Promise<void> => {
      try {
        const { message: msgStr, expired } = readPushSubscription(req)

        if (!msgStr) {
          res.status(200).send('Bad Request')
          return
        }

        if (expired) {
          logger.info('discarding expired message')
          res.status(200).send('Expired')
          return
        }

        const data: { userId: string; type: string } = JSON.parse(msgStr)
        if (!data.userId || !data.type) {
          logger.info('No userId or type found in message')
          res.status(200).send('Bad Request')
          return
        }

        const filePath = `${req.params.folder}/${data.type}/${
          data.userId
        }/${DateTime.now().toFormat('yyyy-LL-dd')}/${uuidv4()}.json`

        logger.info('uploading data to', { filePath })
        await uploadToBucket(
          filePath,
          Buffer.from(msgStr, 'utf8'),
          { contentType: 'application/json' },
          env.fileUpload.gcsUploadPrivateBucket
        )
      } catch (err) {
        logger.error('upload page data failed', err)
        res.status(500).send(err)
        return
      }

      res.status(200).send('OK')
    }
  )

  return router
}
