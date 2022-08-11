/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import express from 'express'
import { readPushSubscription } from '../../datalayer/pubsub'
import { uploadToBucket } from '../../utils/uploads'
import { v4 as uuidv4 } from 'uuid'
import { env } from '../../env'
import { DateTime } from 'luxon'
import { buildLogger } from '../../utils/logger'

const logger = buildLogger('app.dispatch')

export function uploadServiceRouter() {
  const router = express.Router()

  router.post('/:folder', async (req, res) => {
    logger.info('upload data to folder', req.params.folder)
    const { message: msgStr, expired } = readPushSubscription(req)

    if (!msgStr) {
      return res.status(400).send('Bad Request')
    }

    if (expired) {
      logger.info('discarding expired message')
      return res.status(200).send('Expired')
    }

    try {
      const data: { userId: string; type: string } = JSON.parse(msgStr)
      if (!data.userId || !data.type) {
        logger.info('No userId or type found in message')
        return res.status(400).send('Bad Request')
      }

      const filePath = `${req.params.folder}/${data.type}/${
        data.userId
      }/${DateTime.now().toFormat('yyyy-LL-dd')}/${uuidv4()}.json`

      logger.info('uploading data to', filePath)
      await uploadToBucket(
        filePath,
        Buffer.from(msgStr, 'utf8'),
        { contentType: 'application/json' },
        env.fileUpload.gcsUploadPrivateBucket
      )

      res.status(200).send('OK')
    } catch (err) {
      logger.error('upload page data failed', err)
      res.status(500).send(err)
    }
  })

  return router
}
