/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import express from 'express'
import { readPushSubscription } from '../../datalayer/pubsub'
import { generateUploadSignedUrl, uploadToSignedUrl } from '../../utils/uploads'

export function pageServiceRouter() {
  const router = express.Router()

  router.post('/upload/:filename', async (req, res) => {
    console.log('upload page data req', req.query, req.body)
    const { message: msgStr, expired } = readPushSubscription(req)
    console.log('read pubsub message', msgStr, 'has expired', expired)

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
      const uploadUrl = await generateUploadSignedUrl(
        req.params.filename,
        'text/plain'
      )
      await uploadToSignedUrl(uploadUrl, Buffer.from(msgStr, 'utf8'))
      res.status(200)
    } catch (err) {
      console.log('upload page data failed', err)
      res.status(500).send(err)
    }
  })

  return router
}
