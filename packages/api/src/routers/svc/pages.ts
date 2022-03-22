/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import express from 'express'
import { readPushSubscription } from '../../datalayer/pubsub'
import { generateUploadSignedUrl, uploadToSignedUrl } from '../../utils/uploads'
import { v4 as uuidv4 } from 'uuid'
import { env } from '../../env'
import { Page } from '../../elastic/types'
import { DateTime } from 'luxon'

export function pageServiceRouter() {
  const router = express.Router()

  router.post('/upload/:folder', async (req, res) => {
    console.log('upload page data req', req.params.folder)
    const { message: msgStr, expired } = readPushSubscription(req)

    if (!msgStr) {
      res.status(400).send('Bad Request')
      return
    }

    if (expired) {
      console.log('discarding expired message')
      res.status(200).send('Expired')
      return
    }

    try {
      const data: Partial<Page> = JSON.parse(msgStr)
      if (!data.userId) {
        console.log('No userId found in message')
        res.status(400).send('Bad Request')
        return
      }

      const contentType = 'application/json'
      const bucketName = env.fileUpload.gcsUploadPrivateBucket

      console.log('generate upload url')

      const uploadUrl = await generateUploadSignedUrl(
        `${req.params.folder}/${data.userId}/${DateTime.now().toFormat(
          'yyyy-LL-dd'
        )}/${uuidv4()}.json`,
        contentType,
        bucketName
      )

      console.log('start uploading', uploadUrl)

      await uploadToSignedUrl(
        uploadUrl,
        Buffer.from(msgStr, 'utf8'),
        contentType
      )
      res.status(200)
    } catch (err) {
      console.log('upload page data failed', err)
      res.status(500).send(err)
    }
  })

  return router
}
