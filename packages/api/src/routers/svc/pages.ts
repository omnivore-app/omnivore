/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import express from 'express'
import { readPushSubscription } from '../../datalayer/pubsub'
import { generateUploadSignedUrl, uploadToSignedUrl } from '../../utils/uploads'
import { v4 as uuidv4 } from 'uuid'

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
      const contentType = 'application/json'
      const uploadUrl = await generateUploadSignedUrl(
        `${req.params.folder}/${new Date().toDateString()}/${uuidv4()}.json`,
        contentType
      )
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
