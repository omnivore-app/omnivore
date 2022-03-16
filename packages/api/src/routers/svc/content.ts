/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import express from 'express'
import {
  createPubSubClient,
  readPushSubscription,
} from '../../datalayer/pubsub'
import { getPageByParam, updatePage } from '../../elastic'
import { Page } from '../../elastic/types'

interface UpdateContentMessage {
  fileId: string
  content: string
  title?: string
  author?: string
  description?: string
}

export function contentServiceRouter() {
  const router = express.Router()

  router.post('/search', async (req, res) => {
    console.log('search req', req.query, req.body)
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

    const data = JSON.parse(msgStr)
    if (!('fileId' in data) || !('content' in data)) {
      console.log('No file id or content found in message')
      res.status(400).send('Bad Request')
      return
    }
    const msg = data as UpdateContentMessage

    // First attempt to parse the file id out of the name
    const parts = msg.fileId.split('/')
    const fileId = parts && parts.length > 1 ? parts[1] : undefined
    if (!fileId) {
      console.log('No file id found in message')
      res.status(400).send('Bad Request')
      return
    }

    const page = await getPageByParam({ uploadFileId: fileId })
    if (!page) {
      console.log('No upload file found for id:', fileId)
      res.status(400).send('Bad Request')
      return
    }

    const pageToUpdate: Partial<Page> = { content: msg.content }
    if (msg.title) pageToUpdate.title = msg.title
    if (msg.author) pageToUpdate.author = msg.author
    if (msg.description) pageToUpdate.description = msg.description

    const result = await updatePage(page.id, pageToUpdate, {
      pubsub: createPubSubClient(),
      uid: page.userId,
    })
    console.log(
      'Updating article text',
      page.id,
      result,
      msg.content.substring(0, 20)
    )

    res.status(200).send(msg)
  })

  return router
}
