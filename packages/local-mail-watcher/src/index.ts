import { RedisDataSource } from '@omnivore/utils'
import express, { Express, Request, Response, NextFunction, RequestHandler } from 'express'
import { env } from './env'
import { getQueue } from './lib/queue'

console.log('Starting worker...')

const app: Express = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

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

const port = process.env.PORT || 8080
const server = app.listen(port, () => {
  console.log('Mail Server started')
})
