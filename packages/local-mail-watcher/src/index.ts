import { RedisDataSource } from '@omnivore/utils'
import express, { Express, Request, Response } from 'express'

import { env } from './env'
import { getQueue } from './lib/queue'
import { SnsMessage } from './types/SNS'
import { simpleParser } from 'mailparser'
import axios from 'axios'
import { convertToMailObject } from './lib/emailApi'

console.log('Starting worker...')

const app: Express = express()

app.use(express.text({ limit: '50mb' }))
// Force JSON for SNS
app.use((req, res, next) => {
  req.headers['content-type'] = 'application/json'
  next()
})

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

// create redis source
const redisDataSource = new RedisDataSource({
  cache: {
    url: process.env.REDIS_URL,
    cert: process.env.REDIS_CERT,
  },
  mq: {
    url: process.env.MQ_REDIS_URL,
    cert: process.env.MQ_REDIS_CERT,
  },
})
const queue = getQueue(redisDataSource.queueRedisClient)

const addEmailEventToQueue = async (req: Request, res: Response) => {
  const apiKey = req.headers['x-api-key']

  if (!apiKey) {
    res.status(401).send('Unauthorized: API key is missing')
    return
  }

  if (apiKey != env.apiKey) {
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
}

// respond healthy to auto-scaler.
app.get('/_ah/health', (_req: Request, res: Response) => {
  res.sendStatus(200)
})

app.post('/mail', addEmailEventToQueue)

app.post('/sns', async (req, res) => {
  const bodyString = req.body as string
  const snsMessage = JSON.parse(bodyString) as SnsMessage

  console.log(`Received SNS Message`, snsMessage)
  console.log(`Sns Topic ARN ${snsMessage['TopicArn']}`)

  if (snsMessage.TopicArn != env.sns.snsArn) {
    console.log(`Topic ARN: ${snsMessage.TopicArn} Doesnt Match ${env.sns.snsArn}, failing...`)
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
    }
    if (message.notificationType != 'Received') {
      console.log('Not an email, failing...')
      res.status(400).send()
    }

    const mailContent = await simpleParser(message.content)
    const mail = convertToMailObject(mailContent)
    console.log(mail)
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

const port = process.env.PORT || 8080
const server = app.listen(port, () => {
  console.log('Mail Server started')
})
