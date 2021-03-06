/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import express from 'express'
import { readPushSubscription } from '../../datalayer/pubsub'
import { generateUploadSignedUrl, uploadToSignedUrl } from '../../utils/uploads'
import { v4 as uuidv4 } from 'uuid'
import { env } from '../../env'
import { DateTime } from 'luxon'

export function uploadServiceRouter() {
  const router = express.Router()

  router.post('/:folder', async (req, res) => {
    console.log('upload data to folder', req.params.folder)
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
      const data: { userId: string; type: string } = JSON.parse(msgStr)
      if (!data.userId || !data.type) {
        console.log('No userId or type found in message')
        res.status(400).send('Bad Request')
        return
      }

      const contentType = 'application/json'
      const bucketName = env.fileUpload.gcsUploadPrivateBucket

      console.log('generate upload url')

      const uploadUrl = await generateUploadSignedUrl(
        `${req.params.folder}/${data.type}/${
          data.userId
        }/${DateTime.now().toFormat('yyyy-LL-dd')}/${uuidv4()}.json`,
        contentType,
        bucketName
      )

      console.log('start uploading', uploadUrl)

      await uploadToSignedUrl(
        uploadUrl,
        Buffer.from(msgStr, 'utf8'),
        contentType
      )
      res.status(200).send('OK')
    } catch (err) {
      console.log('upload page data failed', err)
      res.status(500).send(err)
    }
  })

  return router
}
