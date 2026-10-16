import express, { Request, Response } from 'express'
import { simpleParser, ParsedMail, HeaderValue } from 'mailparser'
import axios from 'axios'
import { getQueue } from '../../queue-processor'
import { env } from '../../env'

type SnsMessage = {
  Type: string
  TopicArn: string
  SubscribeURL: string
  content: string
  Message: string
}

type EmailContents = {
  from: string
  to: string
  subject: string
  html: string
  text: string
  headers: Map<string, HeaderValue>
  unsubMailTo?: string
  unsubHttpUrl?: string
  forwardedFrom?: string
  replyTo?: string
  confirmationCode?: string
  uploadFile?: {
    fileName: string
    contentType: string
    id: string
  }
}

function decodeBase64(base64String: string): string {
  try {
    return Buffer.from(base64String, 'base64').toString('utf-8')
  } catch (error) {
    console.error('Error decoding base64 string:', error)
    return base64String // Return original string if decoding fails
  }
}

const convertToMailObject = (it: ParsedMail): EmailContents => {
  return {
    from: it.from?.value[0]?.address || '',
    to: (Array.isArray(it.to) ? it.to[0].text : it.to?.text) || '',
    subject: it.subject || '',
    html: it.html || '',
    text: it.text || '',
    headers: it.headers,
  }
}

export function mailRouter() {
  const router = express.Router()
  const queue = getQueue()

  router.use('/', express.json({ limit: '50mb' }))
  router.use('/sns', express.json({ limit: '50mb' }))

  router.use('/sns', express.urlencoded({ limit: '50mb', extended: true }))
  router.use('/', express.urlencoded({ limit: '50mb', extended: true }))

  router.use('/sns', (req, res, next) => {
    req.headers['content-type'] = 'application/json'
    next()
  })
  
  router.post('/', async (req: Request, res: Response) => {
    const apiKey = req.headers['x-api-key']

    if (!apiKey) {
      res.status(401).send('Unauthorized: API key is missing')
      return
    }

    if (apiKey != env.email.apiKey) {
      res.status(401).send('Unauthorized: Invalid API Key')
      return
    }

    await (
      await queue
    ).add('save-newsletter', req.body, {
      priority: 1,
      attempts: 1,
      delay: 500,
    })
    res.sendStatus(200)
  })

  router.post('/sns', async (req, res) => {
    const bodyString = req.body as string
    const snsMessage = JSON.parse(bodyString) as SnsMessage

    console.log(`Received SNS Message`, snsMessage)
    console.log(`Sns Topic ARN ${snsMessage['TopicArn']}`)

    if (snsMessage.TopicArn != env.email.snsArn) {
      console.log(
        `Topic ARN: ${snsMessage.TopicArn} Doesnt Match ${env.email.snsArn}, failing...`
      )
      res.status(401).send()
      return
    }

    if (snsMessage.Type == 'SubscriptionConfirmation') {
      console.log('Subscribing to topic')
      await axios.get(snsMessage.SubscribeURL)
      res.status(200).send()
      return
    }

    if (snsMessage.Type == 'Notification') {
      const message = JSON.parse(snsMessage.Message) as {
        notificationType: string
        content: string
        receipt?: {
          action?: {
            encoding?: string
          }
        }
      }
      if (message.notificationType != 'Received') {
        console.log('Not an email, failing...')
        res.status(400).send()
        return
      }

      // Check if content is base64 encoded and decode if necessary
      let emailContent = message.content
      if (message.receipt?.action?.encoding === 'BASE64') {
        console.log('Detected BASE64 encoded content, decoding...')
        emailContent = decodeBase64(message.content)
        console.log('Processed BASE64 content')
      }

      const mailContent = await simpleParser(emailContent)
      const mail = convertToMailObject(mailContent)

      await (
        await queue
      ).add('save-newsletter', mail, {
        priority: 1,
        attempts: 1,
        delay: 500,
      })
      res.sendStatus(200)

      res.status(200).send()
      return
    }

    res.status(400).send()
  })

  return router
}
